import { Queue, QueueOptions } from 'bullmq';
import { Image } from '@prisma/client';
import { redisConnection } from './redis-connection';

export class ImageDetectionQueue extends Queue<Image> {
  public static readonly queueName = 'image-detection-queue';

  private static instance: ImageDetectionQueue | null = null;

  private constructor(options?: QueueOptions) {
    super(ImageDetectionQueue.queueName, {
      connection: redisConnection,
      ...options,
    });
  }

  public static getInstance(options?: QueueOptions): ImageDetectionQueue {
    if (!this.instance) {
      this.instance = new ImageDetectionQueue(options);
    }
    return this.instance;
  }

  public static getConnection() {
    return redisConnection;
  }
}
