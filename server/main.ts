import { createServer } from 'http';
import { createApp } from './app.js';
import { env } from './config/env.config.js';
import { initSocketServer } from './infrastructure/websocket/socket.server.js';
import { initQueueManager, shutdownQueueManager } from './infrastructure/queues/queue.manager.js';
import { prisma } from './config/database.config.js';

const startServer = async () => {
  try {
    const app = createApp();
    const httpServer = createServer(app);

    initSocketServer(httpServer);
    await initQueueManager();

    httpServer.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
      console.log(`API docs available at http://localhost:${env.PORT}/api/docs`);
    });

    const shutdown = async (signal: string) => {
      console.log(`Shutting down (${signal})...`);
      httpServer.close(async () => {
        await shutdownQueueManager();
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
