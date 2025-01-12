import { Worker } from 'bullmq';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { LogRepository } from '../repositories/log.repository';
import { CategorizationRepository } from '../repositories/categorization.repository';
import { ImageCategorizationQueue } from '../queues/image-categorization.queue';
import { Image } from '@prisma/client';
import { CommandBus } from '../../../shared/command-bus/command-bus';
import { CategorizeImageHandler } from '../../application/handlers/categorize-image.handler';
import { CategorizeImageCommand } from '../../application/commands/categorize-image.command';
import { CategorizeImageService } from '../services/categorize-image.service';

// Initialize worker
async function initializeWorker() {
  console.log('Loading MobileNet model...');
  const model = await mobilenet.load();
  console.log('MobileNet model loaded successfully');

  const categorizeImageService = new CategorizeImageService(model);
  
  // Setup command bus
  const commandBus = new CommandBus();
  const categorizeImageHandler = new CategorizeImageHandler(
    categorizeImageService,
    new LogRepository(),
    new CategorizationRepository()
  );

  // Register handler
  console.log('Registering CategorizeImageCommand handler...');
  commandBus.register('CategorizeImageCommand', categorizeImageHandler);

  return new Worker(
    ImageCategorizationQueue.queueName,
    async (job: { data: Image }) => {
      const image = job.data;
      const command = new CategorizeImageCommand(image);
      await commandBus.execute(command);
    },
    { connection: ImageCategorizationQueue.getConnection() }
  );
}

// Initialize and export the worker
let categorizeImageWorker: Worker;

initializeWorker().then(worker => {
  categorizeImageWorker = worker;

  // Log worker status
  worker.on('completed', (job) => {
    console.log(`categorizationImageWorker Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`categorizationImageWorker Job ${job.id} failed: ${err.message}`);
  });

  worker.on('error', (err) => {
    console.error('categorizationImageWorker error:', err);
  });

  console.log('categorizationImageWorker is running...');
});

export { categorizeImageWorker };
