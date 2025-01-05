import { Worker } from 'bullmq';
import { imageRecognitionQueue, imageRecognitionQueueName } from '../queues/image-recognition.queue.js';
import { RecogniseImageService } from '../services/recognise-image.service.js';
import { LogRepository } from '../repositories/log.repository.js';
import { ClassificationRepository } from '../repositories/classification.repository.js';
const recogniseImageService = new RecogniseImageService();
const logRepository = new LogRepository();
const classificationRepository = new ClassificationRepository();
const recognitionImageWorker = new Worker(imageRecognitionQueueName, async (job) => {
    console.log('### recognition worker job');
    const { imagePath, imageId } = job.data;
    console.log('### abc imageId', imageId);
    logRepository.create({
        imageId,
        status: 'recognition-started',
    });
    const predictions = await recogniseImageService.execute(imagePath);
    console.log('### recognistion-finished');
    console.log('### predictions', predictions);
    logRepository.create({
        imageId,
        status: 'recognition-finished',
    });
    const inputs = predictions.map((prediction) => {
        return {
            label: prediction.className,
            score: prediction.probability,
        };
    });
    classificationRepository.createClassifications({
        inputs,
        imageId,
    });
}, { connection: imageRecognitionQueue.opts.connection });
// Log worker status
recognitionImageWorker.on('completed', (job) => {
    console.log(`recognitionImageWorker Job ${job.id} completed successfully.`);
    console.log('### recognitionImageWorker job.data', job.data);
});
recognitionImageWorker.on('failed', (job, err) => {
    console.error(`recognitionImageWorker Job ${job.id} failed: ${err.message}`);
});
recognitionImageWorker.on('error', (err) => {
    console.error('recognitionImageWorker error:', err);
});
console.log('recognitionImageWorker is running...');
//# sourceMappingURL=recognise-image.worker.js.map