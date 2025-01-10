import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'redis', // Use 'redis' as the default hostname for the Redis service
  port: Number(process.env.REDIS_PORT) || 6379, // Use 6379 as the default port
  maxRetriesPerRequest: null,
});

// console.log('### Redis', Redis)
// console.log('### redisConnection', redisConnection)

export const imageCategorizationQueueName = 'image-categorization-queue'

// Define a shared queue instance
export const imageCategorizationQueue = new Queue(imageCategorizationQueueName, {
  connection: redisConnection,
});

// Optional: Export the Redis connection if you need it elsewhere
export { redisConnection };
