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

  processOverdueTasks().catch((err) => console.error('Initial overdue check error:', err));

  if (isRedisAvailable()) {
    try {
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

      await overdueQueue.add(
        'check-overdue',
        {},
        {
          repeat: {
            every: intervalMs,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        } as any
      );

      console.log(`[scheduler] BullMQ overdue scheduler active (interval: ${env.OVERDUE_JOB_INTERVAL_MINUTES}m)`);
      return;
    } catch (error) {
      console.warn('[scheduler] BullMQ initialization failed, switching to interval timer:', error);
    }
  }

  console.log(`[scheduler] Interval timer active (interval: ${env.OVERDUE_JOB_INTERVAL_MINUTES}m)`);
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
