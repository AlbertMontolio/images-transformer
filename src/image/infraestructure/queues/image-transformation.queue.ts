import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Create a shared Redis connection
// const redisConnection = new Redis({
//   host: 'localhost', // Change if Redis is on another host
//   port: 6379,        // Default Redis port
//   maxRetriesPerRequest: null,
// });

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'redis', // Use 'redis' as the default hostname for the Redis service
  port: Number(process.env.REDIS_PORT) || 6379, // Use 6379 as the default port
  maxRetriesPerRequest: null,
});

export const imageTransformationQueueName = 'image-transformation-queue'

// Define a shared queue instance
// ### TODO: constant file, to store image-recognition
export const imageTransformationQueue = new Queue(imageTransformationQueueName, {
  connection: redisConnection,
});

// Optional: Export the Redis connection if you need it elsewhere
export { redisConnection };
