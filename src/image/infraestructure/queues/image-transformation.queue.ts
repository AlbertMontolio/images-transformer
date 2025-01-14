import { Queue, QueueOptions } from 'bullmq';
import { Image } from '@prisma/client';
import { redisConnection } from './redis-connection';

export class ImageTransformationQueue {
  static readonly queueName = 'image-transformation';
  private static readonly BATCH_SIZE = 10;
  private static readonly BATCH_WAIT_TIME = 5000; // 5 seconds

  private static queue: Queue;

  static getQueue(): Queue {
    if (!this.queue) {
      const queueOptions: QueueOptions = {
        connection: this.getConnection(),
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false
        }
      };
      this.queue = new Queue(this.queueName, queueOptions);
    }
    return this.queue;
  }

  static getConnection() {
    return redisConnection;
  }

  static async addBulk(images: Image[]) {
    const queue = this.getQueue();
    return queue.addBulk(
      images.map(image => ({
        name: 'transform-image',
        data: image,
        opts: {
          // Group jobs for batch processing
          jobId: `transform-${Date.now()}`,
          priority: 1,
          // Jobs will be processed together if they arrive within 5 seconds
          delay: this.BATCH_WAIT_TIME
        }
      }))
    );
  }
}
