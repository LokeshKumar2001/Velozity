import { Queue, Worker } from 'bullmq';
import { env } from '../../config/env.config.js';
import { redisConfig } from '../../config/redis.config.js';
import { isRedisAvailable } from '../cache/redis.client.js';
import { processOverdueTasks } from './workers/task.worker.js';

let overdueQueue: Queue | null = null;
let overdueWorker: Worker | null = null;
let intervalTimer: NodeJS.Timeout | null = null;

export const initQueueManager = async (): Promise<void> => {
  const intervalMs = (env.OVERDUE_JOB_INTERVAL_MINUTES || 5) * 60 * 1000;

  // Run initial overdue check upon server boot
  processOverdueTasks().catch((err) => console.error('Initial overdue check error:', err));

  if (isRedisAvailable()) {
    try {
      console.log('🚀 Initializing BullMQ Overdue Task Queue with Redis...');
      overdueQueue = new Queue('overdue-task-queue', {
        connection: redisConfig,
      });

      overdueWorker = new Worker(
        'overdue-task-queue',
        async (job) => {
          if (job.name === 'check-overdue') {
            await processOverdueTasks();
          }
        },
        { connection: redisConfig }
      );

      // Add repeatable job
      await overdueQueue.add(
        'check-overdue',
        {},
        {
          repeat: {
            every: intervalMs,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        }
      );

      console.log(`✅ BullMQ repeatable overdue scheduler active (every ${env.OVERDUE_JOB_INTERVAL_MINUTES} mins)`);
      return;
    } catch (error) {
      console.warn('⚠️ BullMQ setup failed. Falling back to background interval timer:', error);
    }
  }

  // Fallback: Recurring background interval timer
  console.log(`⏰ Starting resilient background scheduler timer (every ${env.OVERDUE_JOB_INTERVAL_MINUTES} mins)`);
  intervalTimer = setInterval(async () => {
    await processOverdueTasks();
  }, intervalMs);
};

export const shutdownQueueManager = async (): Promise<void> => {
  if (intervalTimer) {
    clearInterval(intervalTimer);
  }
  if (overdueWorker) {
    await overdueWorker.close();
  }
  if (overdueQueue) {
    await overdueQueue.close();
  }
};
