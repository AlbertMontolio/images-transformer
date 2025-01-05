import { Worker } from 'bullmq';
import { imageCategorizationQueue, imageCategorizationQueueName } from '../queues/image-categorization.queue.js';
import { RecogniseImageService } from '../services/recognise-image.service.js';
import { LogRepository } from '../repositories/log.repository.js';
import { CategorizationRepository, CreateCategorizationProp } from '../repositories/categorization.repository.js';

const recogniseImageService = new RecogniseImageService()
const logRepository = new LogRepository()
const categorizationRepository = new CategorizationRepository()

const recognitionImageWorker = new Worker(imageCategorizationQueueName,
    async (job) => {
        const { imagePath, imageId } = job.data;

        logRepository.create({
            imageId,
            status: 'categorization-started',
        })
        const predictions = await recogniseImageService.execute(imagePath)
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
recognitionImageWorker.on('completed', (job) => {
    console.log(`categorizationImageWorker Job ${job.id} completed successfully.`);
    console.log('### categorizationImageWorker job.data', job.data)
});

recognitionImageWorker.on('failed', (job, err) => {
    console.error(`categorizationImageWorker Job ${job.id} failed: ${err.message}`);
});

recognitionImageWorker.on('error', (err) => {
  console.error('categorizationImageWorker error:', err);
});

console.log('categorizationImageWorker is running...');
