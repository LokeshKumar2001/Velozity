import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.config.js';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Velozity Global Solutions — Project Management & Activity Feed API',
    version: '1.0.0',
    description: `
Real-time client project dashboard backend with strict Role-Based Access Control (RBAC),
WebSocket live feeds, and background task management.

### Access Levels:
* **Admin**: Full access across clients, projects, users, and global activity.
* **Project Manager**: Create & manage owned projects, assign tasks, view team activity.
* **Developer**: View assigned tasks only, update task status.
    `,
    contact: {
      name: 'Velozity Engineering Team',
      email: 'engineering@velozity.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token (15-minute lifespan)',
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HttpOnly refresh token cookie for session renewal',
      },
    },
    schemas: {
      StandardError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'FORBIDDEN' },
              message: { type: 'string', example: 'You do not have permission to perform this action' },
              details: { type: 'object', nullable: true },
            },
          },
        },
      },
    },
  },
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: [
    './modules/**/*.routes.ts',
    './modules/**/*.schema.ts',
    './routes/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
