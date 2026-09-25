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

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect();
      return;
    }

    console.log(`Socket connected: ${user.name} (${user.role}) [${socket.id}]`);

    socket.join(`user:${user.userId}`);

    if (user.role === 'ADMIN') {
      socket.join('global:admin');
    } else if (user.role === 'PROJECT_MANAGER') {
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

    const becameOnline = presenceManager.addUser(socket.id, user);
    if (becameOnline) {
      io?.emit(SocketEvent.USER_ONLINE, {
        userId: user.userId,
        name: user.name,
        role: user.role,
      });
    }

    broadcastPresence();

    socket.on('project:join', async (projectId: string) => {
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

    socket.on('disconnect', () => {
      const becameOffline = presenceManager.removeUser(socket.id, user.userId);
      if (becameOffline) {
        io?.emit(SocketEvent.USER_OFFLINE, {
          userId: user.userId,
          name: user.name,
        });
      }
      broadcastPresence();
      console.log(`Socket disconnected: ${user.name}`);
    });
  });

  return io;
};

export const broadcastPresence = (): void => {
  if (!io) return;
  const count = presenceManager.getOnlineCount();
  const onlineUsers = presenceManager.getOnlineUsers();

  io.to('global:admin').emit(SocketEvent.PRESENCE_UPDATE, {
    count,
    onlineUsers,
  });

  io.emit('presence:count', { count });
};

export const broadcastActivity = (activity: ActivityPayload, assignedToUserId?: string | null): void => {
  if (!io) return;

  io.to('global:admin').emit(SocketEvent.ACTIVITY_NEW, activity);
  io.to(`project:${activity.projectId}`).emit(SocketEvent.ACTIVITY_NEW, activity);

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
