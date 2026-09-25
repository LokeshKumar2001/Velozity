import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.config.js';
import { AuthUser } from '../types/express.js';

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export const generateAccessToken = (user: AuthUser): string => {
  const payload: TokenPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (userId: string): { token: string; hash: string; expiresAt: Date } => {
  const token = crypto.randomBytes(40).toString('hex');
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return { token, hash, expiresAt };
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};
