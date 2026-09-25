import { Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt.util.js';

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required for WebSocket connection'));
    }

    const payload = verifyAccessToken(token);
    socket.data.user = {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error: any) {
    next(new Error(`WebSocket authentication failed: ${error.message}`));
  }
};
