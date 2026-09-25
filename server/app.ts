import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.config.js';
import { swaggerSpec } from './config/swagger.config.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './errors/error-handler.js';
import { rateLimiter } from './middleware/rate-limit.middleware.js';

export const createApp = (): Express => {
  const app = express();

  // Basic Security & Parsing Middleware
  app.use(
    cors({
      origin: env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // General rate limiter (150 reqs / 15 mins)
  app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }));

  // Interactive OpenAPI / Swagger Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // Mount API V1 routes
  app.use('/api', apiRouter);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        details: null,
      },
    });
  });

  // Centralized Error Handler (must be mounted last)
  app.use(errorHandler);

  return app;
};

export default createApp;
