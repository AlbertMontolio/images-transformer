import { Worker } from 'bullmq';
import { Image } from '@prisma/client';
import { LogRepository } from '../repositories/log.repository';
import { CommandBus } from '../../../shared/command-bus/command-bus';
import { DetectImageHandler } from '../../application/handlers/detect-image.handler';
import { DetectObjectsService } from '../services/detect-objects.service';
import { ImageDetectionQueue } from '../queues/image-detection.queue';
import { DetectImageCommand } from '../../application/commands/detect-image.command';
import { SaveObjectPredictionsIntoImageUseCase } from '../../application/use-cases/save-object-predictions-into-image.use-case';
import { DetectedObjectRepository } from '../repositories/detected-object.repository';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectionError } from '../../domain/errors/detection.error';

async function initializeWorker() {
  console.log('Loading COCO-SSD model...');
  const model = await cocoSsd.load();
  console.log('COCO-SSD model loaded successfully');

  const detectObjectsService = new DetectObjectsService(model);
  
  // Setup command bus
  const commandBus = new CommandBus();
  const detectImageHandler = new DetectImageHandler(
    detectObjectsService,
    new LogRepository(),
    new SaveObjectPredictionsIntoImageUseCase(),
    new DetectedObjectRepository()
  );

  console.log('Registering DetectImageCommand handler...');
  commandBus.register('DetectImageCommand', detectImageHandler);

  return new Worker(
    ImageDetectionQueue.queueName,
    async (job: { data: Image }) => {
      try {
        const image = job.data;
        const command = new DetectImageCommand(image);
        await commandBus.execute(command);
      } catch (err) {
        if (err instanceof Error && err.name !== 'Error') {
          throw err;
        }
        throw new DetectionError('Detection process failed', err);
      } finally {
        console.log('detectImageWorker finally.', new Date());
      }
    },
    { connection: ImageDetectionQueue.getConnection() }
  );
}

let detectImageWorker: Worker;

initializeWorker().then(worker => {
  detectImageWorker = worker;

  worker.on('drained', () => {
    console.log('detectImageWorker is drained.', new Date());
  });
  
  worker.on('completed', (_job) => {
    // console.log(`detectImageWorker Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`detectImageWorker Job ${job.id} failed:`, {
      errorName: err.name,
      errorMessage: err.message,
      cause: (err as { cause?: unknown }).cause,
      stack: err.stack,
      jobData: job.data
    });
  });

  worker.on('error', (err) => {
    console.error('detectImageWorker error:', err);
  });

  console.log('detectImageWorker is running...');
});

export { detectImageWorker };
