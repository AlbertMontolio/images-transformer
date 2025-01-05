import { imageRecognitionQueue } from '../../infraestructure/queues/image-recognition.queue.js';
import { LogRepository } from '../../infraestructure/repositories/log.repository.js';
export class RecogniseImagesUseCase {
    constructor() { }
    async execute(images) {
        for (const image of images) {
            const imageId = image.id;
            const imagePath = image.path;
            this.recogniseImage({ imagePath, imageId });
        }
    }
    async recogniseImage({ imagePath, imageId, }) {
        try {
            const jobData = {
                imagePath,
                imageId,
            };
            console.log('### adding jobData to queue');
            await imageRecognitionQueue.add('process-image', jobData);
            const logRepository = new LogRepository();
            await logRepository.create({
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
//# sourceMappingURL=recognise-images.use-case.js.map