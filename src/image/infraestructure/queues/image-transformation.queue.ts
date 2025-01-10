import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from './redis-connection';

export type ImageTransformationJobData = {
  imagePath: string; // ### TODO: remove
  imageName: string;
  watermarkText: string;
  imageId: number;
};

export class ImageTransformationQueue extends Queue<ImageTransformationJobData> {
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
