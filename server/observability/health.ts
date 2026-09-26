import { prisma } from '../config/database.config.js';
import { isRedisAvailable } from '../infrastructure/cache/redis.client.js';
import { presenceManager } from '../infrastructure/websocket/presence.manager.js';

export interface SystemHealthStatus {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  uptime: number;
  environment: string;
  services: {
    database: { status: 'UP' | 'DOWN'; latencyMs?: number };
    redis: { status: 'UP' | 'DOWN' };
    websocket: { status: 'UP'; activeConnections: number };
  };
}

export async function checkSystemHealth(): Promise<SystemHealthStatus> {
  const startTime = Date.now();
  let dbStatus: 'UP' | 'DOWN' = 'DOWN';
  let dbLatency: number | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'UP';
    dbLatency = Date.now() - startTime;
  } catch (err) {
    dbStatus = 'DOWN';
  }

  const redisStatus: 'UP' | 'DOWN' = isRedisAvailable() ? 'UP' : 'DOWN';
  const isHealthy = dbStatus === 'UP';

  return {
    status: isHealthy ? (redisStatus === 'UP' ? 'UP' : 'DEGRADED') : 'DOWN',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: {
        status: dbStatus,
        ...(dbLatency !== undefined && { latencyMs: dbLatency }),
      },
      redis: {
        status: redisStatus,
      },
      websocket: {
        status: 'UP',
        activeConnections: presenceManager.getOnlineCount(),
      },
    },
  };
}
