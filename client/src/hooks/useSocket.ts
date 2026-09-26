import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../redux/store.ts';
import { setPresenceCount, setPresenceUpdate } from '../redux/dashboardSlice.ts';
import { addActivity } from '../redux/activitySlice.ts';
import { upsertTask } from '../redux/tasksSlice.ts';
import { addNotification } from '../redux/notificationsSlice.ts';

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to WebSocket server with auth token
    const socket = io('/', {
      path: '/socket.io',
      withCredentials: true,
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Successfully connected
    });

    socket.on('presence:count', (data: { count: number }) => {
      dispatch(setPresenceCount(data.count));
    });

    socket.on('presence:update', (data: { count: number; onlineUsers: any[] }) => {
      dispatch(setPresenceUpdate(data));
    });

    socket.on('activity:new', (activity: any) => {
      dispatch(addActivity(activity));
    });

    socket.on('task:updated', (task: any) => {
      dispatch(upsertTask(task));
    });

    socket.on('task:created', (task: any) => {
      dispatch(upsertTask(task));
    });

    socket.on('notification:new', (notification: any) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, dispatch]);

  const joinProject = (projectId: string) => {
    socketRef.current?.emit('project:join', projectId);
  };

  const leaveProject = (projectId: string) => {
    socketRef.current?.emit('project:leave', projectId);
  };

  return {
    socket: socketRef.current,
    joinProject,
    leaveProject,
  };
};
