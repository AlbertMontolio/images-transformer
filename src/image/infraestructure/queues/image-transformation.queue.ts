import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from './redis-connection';
import { Image } from '@prisma/client';

export type ImageTransformationJobData = {
  imagePath: string; // ### TODO: remove
  imageName: string;
  watermarkText: string;
  imageId: number;
};

export class ImageTransformationQueue extends Queue<Image> {
  public static readonly queueName = 'image-transformation-queue';

  private static instance: ImageTransformationQueue | null = null;

  private constructor(options?: QueueOptions) {
    super(ImageTransformationQueue.queueName, {
      connection: redisConnection,
      ...options,
    });
  }

  /**
   * Get the singleton instance of the queue
   */
  public static getInstance(options?: QueueOptions): ImageTransformationQueue {
    if (!this.instance) {
      this.instance = new ImageTransformationQueue(options);
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
