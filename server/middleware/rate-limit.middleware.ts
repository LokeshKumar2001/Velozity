import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (options: { windowMs?: number; max?: number } = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100; // 100 requests per window

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();

    if (!store[ip] || now > store[ip].resetTime) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[ip].count += 1;

    if (store[ip].count > max) {
      const retryAfter = Math.ceil((store[ip].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      throw new AppError(
        'Too many requests from this IP, please try again later.',
        429,
        undefined as any,
        { retryAfterSeconds: retryAfter }
      );
    }

    next();
  };
};

export default rateLimiter;
