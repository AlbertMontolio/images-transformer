import { Queue } from 'bullmq';
import Redis from 'ioredis';
// Create a shared Redis connection
const redisConnection = new Redis({
    host: 'localhost', // Change if Redis is on another host
    port: 6379, // Default Redis port
    maxRetriesPerRequest: null,
});
// Define a shared queue instance
// ### TODO: constant file, to store image-recognition
export const imageQueue = new Queue('image-recognition', {
    connection: redisConnection,
});
// Optional: Export the Redis connection if you need it elsewhere
export { redisConnection };
//# sourceMappingURL=image-recognition.queue.js.map