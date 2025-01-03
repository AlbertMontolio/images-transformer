import { imageQueue } from '../../infraestructure/queues/image-transformation.queue.js';
export class RecogniseImageUseCase {
    outputImagesDir;
    constructor(outputImagesDir) {
        this.outputImagesDir = outputImagesDir;
    }
    async execute(imagePath) {
        try {
            console.log('### queue', imageQueue);
            console.log('### 123 imagePath', imagePath);
            const jobData = {
                imagePath,
                outputImagesDir: this.outputImagesDir,
            };
            console.log('### adding jobData to queue');
            await imageQueue.add('process-image', jobData);
        }
        catch (err) {
            console.error('Error during classification:', err);
        }
        return true;
    }
}
//# sourceMappingURL=recognise-image.use-case.js.map