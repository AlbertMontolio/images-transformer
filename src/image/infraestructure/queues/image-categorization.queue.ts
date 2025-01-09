import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Create a shared Redis connection
// const redisConnection = new Redis({
//   host: 'localhost', // Change if Redis is on another host
//   port: 6379,        // Default Redis port
//   maxRetriesPerRequest: null,
// });

// Use environment variables to configure Redis connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'redis', // Use 'redis' as the default hostname for the Redis service
  port: Number(process.env.REDIS_PORT) || 6379, // Use 6379 as the default port
  maxRetriesPerRequest: null,
});

export const imageCategorizationQueueName = 'image-categorization-queue'

// Define a shared queue instance
export const imageCategorizationQueue = new Queue(imageCategorizationQueueName, {
  connection: redisConnection,
});

// Optional: Export the Redis connection if you need it elsewhere
export { redisConnection };
