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

const writeImageService = new WriteImageService(outputImagesDir);

// Setup command bus and handler
const commandBus = new CommandBus();
const transformImageHandler = new TransformImageHandler(
  new TransformImageService(),
  new LogRepository()
);

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

      // TODO: improve, create a separate worker for the writing to the output folder
      // and do bulk writing there
      await writeImageService.execute(transformedImage, image.name);

    } catch (error) {
      console.error('Worker processing failed:', error);
      throw error;
    }
  },
  { 
    connection: ImageTransformationQueue.getConnection(),
    concurrency: 5,
    lockDuration: 30000,
  }
);

// Event handlers
transformImageWorker.on('drained', () => {
  console.log('Transform image worker is drained.', new Date());
});

transformImageWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

console.log('Transform image worker is running...');
