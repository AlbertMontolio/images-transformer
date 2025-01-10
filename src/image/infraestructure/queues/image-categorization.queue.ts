import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { redisConnection } from './redis-connection';

dotenv.config();

export class ImageCategorizationQueue {
  private static instance: ImageCategorizationQueue | null = null;
  private queue: Queue;

  private constructor() {
    this.queue = new Queue('image-categorization-queue', {
      connection: redisConnection,
    });
  }

  /**
   * Get the singleton instance of the queue
   */
  public static getInstance(): ImageCategorizationQueue {
    if (!this.instance) {
      this.instance = new ImageCategorizationQueue();
    }
    return this.instance;
  }

  /**
   * Get the underlying BullMQ Queue instance
   */
  public getQueue(): Queue {
    return this.queue;
  }

  /**
   * Close the queue connection
   */
  public async close(): Promise<void> {
    await this.queue.close();
  }
}

// Example usage:
// const queue = ImageCategorizationQueue.getInstance().getQueue();
