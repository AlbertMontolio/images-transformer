// import 'reflect-metadata';
import { Worker, Job } from 'bullmq';
import { TransformImageCommand } from '../../application/commands/transform-image.command';
import { TransformImageHandler } from '../../application/handlers/transform-image.handler';
import { TransformImageService } from '../services/transform-image.service';
import { WriteImageService } from '../services/write-image.service';
import { LogRepository } from '../repositories/log.repository';
import { ImageTransformationQueue } from '../queues/image-transformation.queue';
import { CommandBus } from '../../../shared/command-bus/command-bus';
import { Image } from '@prisma/client';
import { Sharp } from 'sharp';
import { outputImagesDir } from '../../config';
import { TransformedImageRepository } from '../repositories/transformed-image.repository';

const WRITE_BATCH_SIZE = 20; // Larger batch for I/O operations

class TransformImageBatchProcessor {
  private writeBuffer: { image: Sharp; filename: string; imageId: number }[] = [];
  private readonly writeImageService: WriteImageService;
  private readonly logRepository: LogRepository;
  private readonly transformedImageRepository: TransformedImageRepository;

  constructor() {
    this.writeImageService = new WriteImageService(outputImagesDir);
    this.logRepository = new LogRepository();
    this.transformedImageRepository = new TransformedImageRepository();
  }

  async addToWriteBuffer(transformedImage: { image: Sharp; filename: string; imageId: number }) {
    this.writeBuffer.push(transformedImage);
    
    if (this.writeBuffer.length >= WRITE_BATCH_SIZE) {
      await this.flushWriteBuffer();
    }
  }

  async flushWriteBuffer() {
    if (this.writeBuffer.length === 0) return;

    try {
      const batchId = `batch-${Date.now()}`;

      // Single bulk write operation
      await this.writeImageService.executeMany([...this.writeBuffer]);
      console.log('Batch storage completed successfully.');

      // Update writtenAt timestamp for all images in the batch
      const imageIds = this.writeBuffer.map(item => item.imageId);
      console.log('### imageIds', imageIds);

      // Clear the buffer after successful write
      this.writeBuffer = [];
    } catch (error) {
      console.error('Batch storage failed:', error);
      throw error;
    }
  }
}

// Setup command bus and handler
const commandBus = new CommandBus();
const transformImageHandler = new TransformImageHandler(
  new TransformImageService(),
  new LogRepository()
);
const batchProcessor = new TransformImageBatchProcessor();

// Register handler
commandBus.register('TransformImageCommand', transformImageHandler);

const transformImageWorker = new Worker(
  ImageTransformationQueue.queueName,
  async (job: Job) => {
    try {
      const image = job.data as Image;
      const command = new TransformImageCommand(
        image,
        'Albert Montolio watermark'
      );
      
      const transformedImage = await commandBus.execute(command) as Sharp;
      await batchProcessor.addToWriteBuffer({
        image: transformedImage,
        filename: image.name,
        imageId: image.id
      });

    } catch (error) {
      console.error('Worker processing failed:', error);
      throw error; // This will mark the job as failed
    } finally {
      console.log('transformImageWorker finally.', new Date());
    }
  },
  { 
    connection: ImageTransformationQueue.getConnection(),
    concurrency: 5, // Process multiple jobs concurrently
    lockDuration: 30000,
  }
);

// ### TODO: process???????? or worker???????
// Shutdown handlers stay the same
process.on('SIGTERM', async () => {
  await batchProcessor.flushWriteBuffer();
});

process.on('SIGINT', async () => {
  await batchProcessor.flushWriteBuffer();
});

transformImageWorker.on('drained', async () => {
  await batchProcessor.flushWriteBuffer();

  console.log('transformImageWorker is drained.', new Date());
});

// Event handlers stay the same
transformImageWorker.on('completed', (_job) => {
  // console.log(`Job ${job.id} completed successfully.`);
});

transformImageWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

console.log('Transform image worker is running...');
