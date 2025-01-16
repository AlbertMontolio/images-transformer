import { createClient } from 'redis';
import { redisHost } from '../../image/config';

export class RedisPublisherService {
  private static instance: RedisPublisherService;
  private publisher: any;

  private constructor() {
    this.publisher = createClient({
      url: `redis://${redisHost}:${process.env.REDIS_PORT}`
    });
    
    this.publisher.connect().then(() => {
      console.log('Redis publisher connected');
    });
  }

  public static getInstance(): RedisPublisherService {
    if (!RedisPublisherService.instance) {
      RedisPublisherService.instance = new RedisPublisherService();
    }
    return RedisPublisherService.instance;
  }

  public async publish(data: any): Promise<void> {
    await this.publisher.publish('websocket-channel', JSON.stringify(data));
  }
} 