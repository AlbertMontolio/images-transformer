import { Worker } from 'bullmq';
import { imageTransformationQueueName, imageTransformationQueue } from "../queues/image-transformation.queue.js";
import { TransformImageService } from '../services/transform-image.service.js';
import { LogRepository } from '../repositories/log.repository.js';
const transformImageService = new TransformImageService();
const logRepository = new LogRepository();
const transformImageWorker = new Worker(imageTransformationQueueName, async (job) => {
    console.log('### transformation worker job', job.data);
    const { outputImagesDir, imagePath, watermarkText, imageId } = job.data;
    console.log('### albert 1');
    await logRepository.create({ imageId, status: 'transformation-started' });
    console.log('### albert 2');
    await transformImageService.execute({
        imagePath,
        watermarkText,
        outputImagesDir,
        imageId,
    });
    console.log('### albert 3');
    logRepository.create({ imageId, status: 'transformation-finished' });
}, { connection: imageTransformationQueue.opts.connection });
// Log worker status
transformImageWorker.on('completed', (job) => {
    console.log(`transformImageWorker Job ${job.id} completed successfully.`);
    console.log('### transformImageWorker job.data', job.data);
});
transformImageWorker.on('failed', (job, err) => {
    console.error(`transformImageWorker Job ${job.id} failed: ${err.message}`);
});
transformImageWorker.on('error', (err) => {
    console.error('transformImageWorker error:', err);
});
console.log('transformImageWorker is running...');
//# sourceMappingURL=transform-image.worker.js.map