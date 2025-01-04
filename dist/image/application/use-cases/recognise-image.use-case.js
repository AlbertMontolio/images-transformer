import { imageQueue } from '../../infraestructure/queues/image-recognition.queue.js';
import { LogRepository } from '../../infraestructure/repositories/log.repository.js';
export class RecogniseImageUseCase {
    outputImagesDir;
    constructor(outputImagesDir) {
        this.outputImagesDir = outputImagesDir;
    }
    async execute({ imagePath, imageId, }) {
        try {
            const jobData = {
                imagePath,
                outputImagesDir: this.outputImagesDir,
                imageId,
            };
            console.log('### adding jobData to queue', imageQueue);
            await imageQueue.add('process-image', jobData);
            const logRepository = new LogRepository();
            await logRepository.createLog({
                imageId,
                status: 'sent-to-queue'
            });
        }
        catch (err) {
            console.error('Error during classification:', err);
        }
        return true;
    }
}
//# sourceMappingURL=recognise-image.use-case.js.map