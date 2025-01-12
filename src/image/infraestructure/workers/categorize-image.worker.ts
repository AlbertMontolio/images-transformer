import { Worker } from 'bullmq';
import { CategorizeImageService } from '../services/categorize-image.service';
import { LogRepository } from '../repositories/log.repository';
import { CategorizationRepository } from '../repositories/categorization.repository';
import { ImageCategorizationQueue } from '../queues/image-categorization.queue';
import { Image } from '@prisma/client';
import { CommandBus } from 'src/shared/command-bus/command-bus';
import { CategorizeImageHandler } from '../../application/handlers/categorize-image.handler';
import { CategorizeImageCommand } from 'src/image/application/commands/categorize-image.command';


// Setup command bus
const commandBus = new CommandBus();
const categorizeImageHandler = new CategorizeImageHandler(
  new CategorizeImageService(),
  new LogRepository(),
  new CategorizationRepository()
);

// Register handler
console.log('Registering CategorizeImageCommand handler...');
// TODO: use symbol instead of string
commandBus.register('CategorizeImageCommand', categorizeImageHandler);

export const categorizeImageWorker = new Worker(ImageCategorizationQueue.queueName,
    async (job: { data: Image }) => {
        const image = job.data;
        const command = new CategorizeImageCommand(image);
        await commandBus.execute(command);
    },
    { connection: ImageCategorizationQueue.getConnection() }
);

// Log worker status
categorizeImageWorker.on('completed', (job) => {
    console.log(`categorizationImageWorker Job ${job.id} completed successfully.`);
});

categorizeImageWorker.on('failed', (job, err) => {
    console.error(`categorizationImageWorker Job ${job.id} failed: ${err.message}`);
});

categorizeImageWorker.on('error', (err) => {
  console.error('categorizationImageWorker error:', err);
});

console.log('categorizationImageWorker is running...');
