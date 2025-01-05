import { Queue } from 'bullmq';
import Redis from 'ioredis';
// Create a shared Redis connection
const redisConnection = new Redis({
    host: 'localhost', // Change if Redis is on another host
    port: 6379, // Default Redis port
    maxRetriesPerRequest: null,
});
export const imageCategorizationQueueName = 'image-categorization-queue';
// Define a shared queue instance
export const imageCategorizationQueue = new Queue(imageCategorizationQueueName, {
    connection: redisConnection,
});
// Optional: Export the Redis connection if you need it elsewhere
export { redisConnection };
//# sourceMappingURL=image-categorization.queue.js.map