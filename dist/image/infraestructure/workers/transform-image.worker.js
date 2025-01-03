import { Worker } from 'bullmq';
import { imageQueue } from '../queues/image-transformation.queue.js';
import { RecogniseImageService } from '../services/recognise-image.service.js';
const worker = new Worker('image-transformation', async (job) => {
    console.log('### worker job', job);
    const { imagePath, outputImagesDir } = job.data;
    const recogniseImageService = new RecogniseImageService();
    await recogniseImageService.execute(imagePath);
}, { connection: imageQueue.opts.connection });
// Log worker status
worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
    console.log('### job.data', job.data);
});
worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});
worker.on('error', (err) => {
    console.error('Worker error:', err);
});
console.log('Worker is running...');
//# sourceMappingURL=transform-image.worker.js.map