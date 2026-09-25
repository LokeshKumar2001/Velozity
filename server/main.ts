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

    // Initialize Real-time WebSocket Engine
    initSocketServer(httpServer);

    // Initialize Background Job Queue Manager
    await initQueueManager();

    httpServer.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Velozity Server listening on port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`📚 Swagger Docs: http://localhost:${env.PORT}/api/docs`);
      console.log(`⚡ WebSocket Engine: Initialized`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      httpServer.close(async () => {
        console.log('🔒 HTTP server closed');
        await shutdownQueueManager();
        await prisma.$disconnect();
        console.log('📦 Database connections closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
