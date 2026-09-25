import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from '../../config/env.config.js';
import { socketAuthMiddleware } from './socket.authentication.js';
import { presenceManager } from './presence.manager.js';
import { SocketEvent, ActivityPayload, NotificationPayload } from './socket.events.js';
import { prisma } from '../../config/database.config.js';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Enforce JWT handshake authentication
  io.use(socketAuthMiddleware);

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect();
      return;
    }

    console.log(`🔌 Socket connected: ${user.name} (${user.role}) [socket: ${socket.id}]`);

    // 1. Join private user room for direct alerts and assigned task events
    socket.join(`user:${user.userId}`);

    // 2. Role-based initial room subscriptions
    if (user.role === 'ADMIN') {
      socket.join('global:admin');
    } else if (user.role === 'PROJECT_MANAGER') {
      // Auto-join rooms for projects managed by this PM
      try {
        const managedProjects = await prisma.project.findMany({
          where: { managerId: user.userId },
          select: { id: true },
        });
        managedProjects.forEach((p) => socket.join(`project:${p.id}`));
      } catch (err) {
        console.error('Failed to auto-join PM project rooms:', err);
      }
    }

    // 3. Register user presence
    const becameOnline = presenceManager.addUser(socket.id, user);
    if (becameOnline) {
      io?.emit(SocketEvent.USER_ONLINE, {
        userId: user.userId,
        name: user.name,
        role: user.role,
      });
    }

    // Broadcast current presence count to Admins
    broadcastPresence();

    // 4. Handle dynamic client subscriptions (e.g. user opens a project board)
    socket.on('project:join', async (projectId: string) => {
      // Security check: ensure user has permission to view this project
      try {
        if (user.role === 'ADMIN') {
          socket.join(`project:${projectId}`);
        } else if (user.role === 'PROJECT_MANAGER') {
          const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { managerId: true },
          });
          if (project?.managerId === user.userId) {
            socket.join(`project:${projectId}`);
          }
        } else if (user.role === 'DEVELOPER') {
          // Dev can join if they have at least one task assigned in the project
          const hasTask = await prisma.task.findFirst({
            where: { projectId, assignedTo: user.userId },
            select: { id: true },
          });
          if (hasTask) {
            socket.join(`project:${projectId}`);
          }
        }
      } catch (err) {
        console.error('Error in project:join handler:', err);
      }
    });

    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    // 5. Handle Disconnect
    socket.on('disconnect', () => {
      const becameOffline = presenceManager.removeUser(socket.id, user.userId);
      if (becameOffline) {
        io?.emit(SocketEvent.USER_OFFLINE, {
          userId: user.userId,
          name: user.name,
        });
      }
      broadcastPresence();
      console.log(`🔌 Socket disconnected: ${user.name}`);
    });
  });

  return io;
};

export const broadcastPresence = (): void => {
  if (!io) return;
  const count = presenceManager.getOnlineCount();
  const onlineUsers = presenceManager.getOnlineUsers();

  // Admins see the full presence roster and count
  io.to('global:admin').emit(SocketEvent.PRESENCE_UPDATE, {
    count,
    onlineUsers,
  });

  // Standard broadcast for dashboard counter
  io.emit('presence:count', { count });
};

export const broadcastActivity = (activity: ActivityPayload, assignedToUserId?: string | null): void => {
  if (!io) return;

  // 1. Admin receives all activities globally
  io.to('global:admin').emit(SocketEvent.ACTIVITY_NEW, activity);

  // 2. Active viewers and PMs of this project receive the event
  io.to(`project:${activity.projectId}`).emit(SocketEvent.ACTIVITY_NEW, activity);

  // 3. Assigned developer receives it in their private channel
  if (assignedToUserId && assignedToUserId !== activity.userId) {
    io.to(`user:${assignedToUserId}`).emit(SocketEvent.ACTIVITY_NEW, activity);
  }
};

export const broadcastTaskUpdate = (projectId: string, task: any, assignedToUserId?: string | null): void => {
  if (!io) return;
  io.to('global:admin').emit(SocketEvent.TASK_UPDATED, task);
  io.to(`project:${projectId}`).emit(SocketEvent.TASK_UPDATED, task);
  if (assignedToUserId) {
    io.to(`user:${assignedToUserId}`).emit(SocketEvent.TASK_UPDATED, task);
  }
};

export const sendRealtimeNotification = (notification: NotificationPayload): void => {
  if (!io) return;
  io.to(`user:${notification.userId}`).emit(SocketEvent.NOTIFICATION_NEW, notification);
};

export const getIO = (): SocketIOServer | null => io;
