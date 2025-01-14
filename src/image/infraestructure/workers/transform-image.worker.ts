// import 'reflect-metadata';
import { Worker, Job } from 'bullmq';
import { TransformImageCommand } from '../../application/commands/transform-image.command';
import { TransformImageHandler } from '../../application/handlers/transform-image.handler';
import { TransformImageService } from '../services/transform-image.service';
import { SaveImageInFolderService } from '../services/save-image-in-folder.service';
import { LogRepository } from '../repositories/log.repository';
import { ImageTransformationQueue } from '../queues/image-transformation.queue';
import { CommandBus } from '../../../shared/command-bus/command-bus';
import { Image } from '@prisma/client';
import { Sharp } from 'sharp';
import { outputImagesDir } from '../../config';

const WRITE_BATCH_SIZE = 20; // Larger batch for I/O operations

class TransformImageBatchProcessor {
  private writeBuffer: { image: Sharp; filename: string; imageId: number }[] = [];
  private readonly saveImageInFolderService: SaveImageInFolderService;
  private readonly logRepository: LogRepository;

  constructor() {
    this.saveImageInFolderService = new SaveImageInFolderService(outputImagesDir);
    this.logRepository = new LogRepository();
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
      // await this.logRepository.createStartedProcessLog(
      //   batchId,
      //   'transformation_storage_batch'
      // );

      // Single bulk write operation
      await this.saveImageInFolderService.executeMany([...this.writeBuffer]);

      // await this.logRepository.createCompletedProcessLog(
      //   batchId,
      //   'transformation_storage_batch'
      // );

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
      
      try {
        const transformedImage = await commandBus.execute(command) as Sharp;
        await batchProcessor.addToWriteBuffer({
          image: transformedImage,
          filename: image.name,
          imageId: image.id
        });
      } catch (error) {
        console.error(`Failed to transform image ${image.id}:`, error);
        throw error;
      }

    } catch (error) {
      console.error('Worker processing failed:', error);
      throw error; // This will mark the job as failed
    }
  },
  { 
    connection: ImageTransformationQueue.getConnection(),
    concurrency: 5, // Process multiple jobs concurrently
    lockDuration: 30000,
  }
);

// Shutdown handlers stay the same
process.on('SIGTERM', async () => {
  await batchProcessor.flushWriteBuffer();
});

process.on('SIGINT', async () => {
  await batchProcessor.flushWriteBuffer();
});

// Event handlers stay the same
transformImageWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

transformImageWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

transformImageWorker.on('drained', async () => {
  await batchProcessor.flushWriteBuffer();
});

console.log('Transform image worker is running...');
