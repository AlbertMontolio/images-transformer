import { Worker } from 'bullmq';
import { LogRepository } from '../repositories/log.repository';
import { CommandBus } from '../../../shared/command-bus/command-bus';
import { Image } from '@prisma/client';
import { DetectImageHandler } from 'src/image/application/handlers/detect-image.handler';
import { DetectObjectsService } from '../services/detect-objects.service';
import { ImageDetectionQueue } from '../queues/image-detection.queue';
import { DetectImageCommand } from 'src/image/application/commands/detect-image.command';

// Setup command bus
const commandBus = new CommandBus();
const detectImageHandler = new DetectImageHandler(
  new DetectObjectsService(),
  new LogRepository()
);

// Register handler
console.log('Registering DetectImageCommand handler...');
// TODO: use symbol instead of string
commandBus.register('DetectImageCommand', detectImageHandler);

const detectImageWorker = new Worker(
  ImageDetectionQueue.queueName,
  async (job: { data: Image }) => {
    const image = job.data;

    const command = new DetectImageCommand(image);

    await commandBus.execute(command);
  },
  { connection: ImageDetectionQueue.getConnection() }
);

// Log worker status
detectImageWorker.on('completed', (job) => {
  console.log(`detectImageWorker Job ${job.id} completed successfully.`);
});

detectImageWorker.on('failed', (job, err) => {
  console.error(`detectImageWorker Job ${job.id} failed: ${err.message}`);
});

detectImageWorker.on('error', (err) => {
console.error('detectImageWorker error:', err);
});

console.log('detectImageWorker is running...');
