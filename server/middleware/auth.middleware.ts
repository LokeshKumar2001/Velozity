import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { AppError } from '../errors/app-error.js';
import { UserRole } from '@prisma/client';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthenticated('Missing or malformed Authorization header');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role as UserRole,
    };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw AppError.unauthenticated('Access token has expired. Please refresh your session.');
    }
    throw AppError.unauthenticated('Invalid access token');
  }
};

export default authenticateToken;
