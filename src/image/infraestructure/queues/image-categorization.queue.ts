import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from './redis-connection';
import { Image } from '@prisma/client';

// ### TODO: refactor in a base queue
export class ImageCategorizationQueue extends Queue<Image> {
  public static readonly queueName = 'image-categorization-queue';

  private static instance: ImageCategorizationQueue | null = null;

  private constructor(options?: QueueOptions) {
    super(ImageCategorizationQueue.queueName, {
      connection: redisConnection,
      ...options,
    });
  }

  /**
   * Get the singleton instance of the queue
   */
  public static getInstance(options?: QueueOptions): ImageCategorizationQueue {
    if (!this.instance) {
      this.instance = new ImageCategorizationQueue(options);
    }
    return this.instance;
  }

  /**
   * Expose the Redis connection
   */
  public static getConnection() {
    return redisConnection;
  }
}
