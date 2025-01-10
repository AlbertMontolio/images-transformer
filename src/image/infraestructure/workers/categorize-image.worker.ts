import { Worker } from 'bullmq';
import { CategorizeImageService } from '../services/categorize-image.service';
import { LogRepository } from '../repositories/log.repository';
import { CategorizationRepository, CreateCategorizationProp } from '../repositories/categorization.repository';
import { ImageCategorizationJobData, ImageCategorizationQueue } from '../queues/image-categorization.queue';

const categorizeImageService = new CategorizeImageService()
const logRepository = new LogRepository()
const categorizationRepository = new CategorizationRepository()

export const categorizeImageWorker = new Worker(ImageCategorizationQueue.queueName,
    async (job: { data: ImageCategorizationJobData }) => {
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
