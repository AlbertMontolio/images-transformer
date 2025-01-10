import { Worker } from 'bullmq';
import { imageTransformationQueueName, imageTransformationQueue } from "../queues/image-transformation.queue";
import { TransformImageService } from '../services/transform-image.service';
import { TransformationJobData } from '../types/transformation.job-data';
import { LogRepository } from '../repositories/log.repository';

type Job = {
  data: TransformationJobData;
}

const transformImageService = new TransformImageService()
const logRepository = new LogRepository()

const transformImageWorker = new Worker(
  imageTransformationQueueName,
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
    console.log('### albert 3')

    logRepository.create({ imageId, status: 'transformation-finished' })
  },
  { connection: imageTransformationQueue.opts.connection }
)

// Log worker status
transformImageWorker.on('completed', (job) => {
  console.log(`transformImageWorker Job ${job.id} completed successfully.`);
  console.log('### transformImageWorker job.data', job.data)
});

transformImageWorker.on('failed', (job, err) => {
  console.error(`transformImageWorker Job ${job.id} failed: ${err.message}`);
});

transformImageWorker.on('error', (err) => {
console.error('transformImageWorker error:', err);
});

console.log('transformImageWorker is running...');