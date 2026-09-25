import Redis from 'ioredis';
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
    retryStrategy: (times) => {
      if (times > 3) {
        return null; // Stop retrying after 3 attempts
      }
      return Math.min(times * 100, 1000);
    },
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Connected to Redis successfully');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Suppress repeated spam if Redis is offline during local dev
  });

  // Attempt connection asynchronously
  redisClient.connect().catch(() => {
    console.log('ℹ️ Redis server not reachable locally. Utilizing fallback mechanisms.');
  });
} catch (error) {
  console.log('ℹ️ Redis initialization skipped.');
}

export const getRedisClient = (): Redis | null => redisClient;
export const isRedisAvailable = (): boolean => isRedisConnected;
export default redisClient;
