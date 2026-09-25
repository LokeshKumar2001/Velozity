import { Redis } from 'ioredis';
import { env } from '../../config/env.config.js';

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times: number) => {
      if (times > 3) {
        return null;
      }
      return Math.min(times * 100, 1000);
    },
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('[redis] connected');
  });

  redisClient.on('error', () => {
    isRedisConnected = false;
  });

  redisClient.connect().catch(() => {
    console.log('[redis] offline, continuing with fallback');
  });
} catch (error) {
  console.log('[redis] connection skipped');
}

export const getRedisClient = (): Redis | null => redisClient;
export const isRedisAvailable = (): boolean => isRedisConnected;
export default redisClient;
