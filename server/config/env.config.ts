import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().optional().default(''),
  JWT_ACCESS_SECRET: z.string().default('velozity_super_secret_access_jwt_key'),
  JWT_REFRESH_SECRET: z.string().default('velozity_super_secret_refresh_jwt_key'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  OVERDUE_JOB_INTERVAL_MINUTES: z.string().default('5').transform((val) => parseInt(val, 10)),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('Environment validation warning, using default configuration:', parsed.error.format());
}

const fallbackEnv = {
  PORT: 5000,
  NODE_ENV: (process.env.NODE_ENV as any) || 'production',
  CLIENT_URL: process.env.CLIENT_URL || '*',
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:Velozity-App@db.redtnalmbqdocdapmgcd.supabase.co:5432/postgres",
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'velozity_super_secret_access_jwt_key_2026_at_least_32_chars',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'velozity_super_secret_refresh_jwt_key_2026_at_least_32_chars',
  JWT_ACCESS_EXPIRATION: '15m',
  JWT_REFRESH_EXPIRATION: '7d',
  OVERDUE_JOB_INTERVAL_MINUTES: 5,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
};


export const env = parsed.success ? parsed.data : fallbackEnv;

