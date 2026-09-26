import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../errors/error-handler.js';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  return errorHandler(err, req, res, next);
};

export default errorMiddleware;
