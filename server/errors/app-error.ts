import { ErrorCode } from './error-codes.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly details: any;

  constructor(message: string, statusCode: number = 500, errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: any) {
    return new AppError(message, 400, ErrorCode.BAD_REQUEST, details);
  }

  static unauthenticated(message: string = 'Authentication required', details?: any) {
    return new AppError(message, 401, ErrorCode.UNAUTHENTICATED, details);
  }

  static forbidden(message: string = 'You do not have permission to perform this action', details?: any) {
    return new AppError(message, 403, ErrorCode.FORBIDDEN, details);
  }

  static notFound(message: string = 'Resource not found', details?: any) {
    return new AppError(message, 404, ErrorCode.NOT_FOUND, details);
  }

  static conflict(message: string, details?: any) {
    return new AppError(message, 409, ErrorCode.CONFLICT, details);
  }

  static validation(message: string, details?: any) {
    return new AppError(message, 422, ErrorCode.VALIDATION_ERROR, details);
  }

  static internal(message: string = 'Internal server error', details?: any) {
    return new AppError(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, details);
  }
}
