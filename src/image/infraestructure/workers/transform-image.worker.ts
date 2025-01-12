import { Worker } from 'bullmq';
import { TransformImageCommand } from '../../application/commands/transform-image.command';
import { TransformImageHandler } from '../../application/handlers/transform-image.handler';
import { TransformImageService } from '../services/transform-image.service';
import { LogRepository } from '../repositories/log.repository';
import { ImageTransformationJobData, ImageTransformationQueue } from '../queues/image-transformation.queue';
import { CommandBus } from '../../../shared/command-bus/command-bus';

type Job = {
  data: ImageTransformationJobData;
}

// Setup command bus
const commandBus = new CommandBus();
const transformImageHandler = new TransformImageHandler(
  new TransformImageService(),
  new LogRepository()
);

// Register handler
console.log('Registering TransformImageCommand handler...');
// TODO: use symbol instead of string
commandBus.register('TransformImageCommand', transformImageHandler);

const transformImageWorker = new Worker(
  ImageTransformationQueue.queueName,
  async (job: Job) => {
    const { imagePath, watermarkText, imageId, imageName } = job.data;

    const command = new TransformImageCommand(
      imagePath,
      imageName,
      watermarkText,
      imageId
    );

    await commandBus.execute(command);
  },
  { connection: ImageTransformationQueue.getConnection() }
);

// Log worker status
transformImageWorker.on('completed', (job) => {
  console.log(`transformImageWorker Job ${job.id} completed successfully.`);
});

transformImageWorker.on('failed', (job, err) => {
  console.error(`transformImageWorker Job ${job.id} failed: ${err.message}`);
});

transformImageWorker.on('error', (err) => {
console.error('transformImageWorker error:', err);
});

console.log('categorizationImageWorker is running...');
