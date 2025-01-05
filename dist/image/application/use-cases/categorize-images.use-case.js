import { imageCategorizationQueue } from '../../infraestructure/queues/image-categorization.queue.js';
import { LogRepository } from '../../infraestructure/repositories/log.repository.js';
export class CategorizeImagesUseCase {
    constructor() { }
    async execute(images) {
        for (const image of images) {
            const imageId = image.id;
            const imagePath = image.path;
            this.categorizeImage({ imagePath, imageId });
        }
    }
    async categorizeImage({ imagePath, imageId, }) {
        try {
            const jobData = {
                imagePath,
                imageId,
            };
            console.log('### adding jobData to queue');
            await imageCategorizationQueue.add('process-image', jobData);
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
//# sourceMappingURL=categorize-images.use-case.js.map