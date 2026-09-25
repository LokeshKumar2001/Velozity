import { Request, Response, NextFunction } from 'express';
import { AppError } from './app-error.js';
import { ErrorCode } from './error-codes.js';
import { env } from '../config/env.config.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(422).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed for request input',
        details: formattedErrors,
      },
    });
    return;
  }

  // Handle known AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details || null,
      },
    });
    return;
  }

  // Handle unhandled unexpected runtime exceptions
  console.error('💥 Unhandled Exception:', err);

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected internal error occurred. Please try again later.',
      // Never expose raw stack traces in production
      details: env.NODE_ENV === 'development' ? err.message : null,
    },
  });
};

export default errorHandler;
