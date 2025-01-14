import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from './redis-connection';
import { Image } from '@prisma/client';

export class ImageTransformationQueue extends Queue<Image> {
  public static readonly queueName = 'image-transformation-queue';

  private static instance: ImageTransformationQueue | null = null;

  private constructor(options?: QueueOptions) {
    super(ImageTransformationQueue.queueName, {
      connection: redisConnection,
      ...options,
    });
  }

  // ### TODO: refactor with base class
  public static getInstance(options?: QueueOptions): ImageTransformationQueue {
    if (!this.instance) {
      this.instance = new ImageTransformationQueue(options);
    }
    return this.instance;
  }

  public static getConnection() {
    return redisConnection;
  }
}
