import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: any[];
}

export class HttpResponse {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200, meta?: Record<string, any>): Response {
    const payload: ApiResponse<T> = {
      success: true,
      ...(message && { message }),
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
    return HttpResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(res: Response, message: string, statusCode: number = 400, errors?: any[]): Response {
    const payload: ApiResponse = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(payload);
  }
}
