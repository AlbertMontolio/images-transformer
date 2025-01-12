import { Worker } from 'bullmq';
import { TransformImageService } from '../services/transform-image.service';
import { LogRepository } from '../repositories/log.repository';
import { ImageTransformationJobData, ImageTransformationQueue } from '../queues/image-transformation.queue';

type Job = {
  data: ImageTransformationJobData;
}

const transformImageService = new TransformImageService()
const logRepository = new LogRepository()

const transformImageWorker = new Worker(
  ImageTransformationQueue.queueName,
  async (job: Job) => {
    // ### TODO: remove name?
    const { imagePath, watermarkText, imageId, imageName } = job.data

    await logRepository.create({ imageId, status: 'transformation-started' })

    await transformImageService.execute({
      imagePath,
      imageName,
      watermarkText,
      imageId,
    })

    logRepository.create({ imageId, status: 'transformation-finished' })
  },
  { connection: ImageTransformationQueue.getConnection() }
)

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
