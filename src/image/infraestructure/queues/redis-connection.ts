import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// TODO: use singleton
export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'redis', // Use 'redis' as the default hostname for the Redis service
  port: Number(process.env.REDIS_PORT) || 6379, // Use 6379 as the default port
  maxRetriesPerRequest: null,
});
