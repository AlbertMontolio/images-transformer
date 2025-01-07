import { Worker } from 'bullmq';
import { imageCategorizationQueue, imageCategorizationQueueName } from '../queues/image-categorization.queue.js';
import { CategorizeImageService } from '../services/categorize-image.service.js';
import { LogRepository } from '../repositories/log.repository.js';
import { CategorizationRepository, CreateCategorizationProp } from '../repositories/categorization.repository.js';

const categorizeImageService = new CategorizeImageService()
const logRepository = new LogRepository()
const categorizationRepository = new CategorizationRepository()

const categorizeImageWorker = new Worker(imageCategorizationQueueName,
    async (job) => {
        const { imagePath, imageId } = job.data;
        console.log({ imagePath, imageId })

        logRepository.create({
            imageId,
            status: 'categorization-started',
        })
        const predictions = await categorizeImageService.execute(imagePath)
        logRepository.create({
            imageId,
            status: 'categorization-finished',
        })

        const inputs: CreateCategorizationProp[] = predictions.map((prediction) => {
            return {
                label: prediction.className,
                score: prediction.probability,
            }
        })
        categorizationRepository.createMany({
            inputs,
            imageId,
        })
    },
    { connection: imageCategorizationQueue.opts.connection }
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
