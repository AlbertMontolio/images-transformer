import { Worker } from 'bullmq';
import { imageQueue } from '../queues/image-recognition.queue.js';
import { RecogniseImageService } from '../services/recognise-image.service.js';
const worker = new Worker('image-recognition', async (job) => {
    console.log('### worker job', job);
    const { imagePath, outputImagesDir, imageId } = job.data;
    const recogniseImageService = new RecogniseImageService();
    await recogniseImageService.execute({
        imageId,
        imagePath,
    });
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
//# sourceMappingURL=recognise-image.worker.js.map