import { imageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue.js";
export class TransformImagesUseCase {
    outputImagesDir;
    constructor(outputImagesDir) {
        this.outputImagesDir = outputImagesDir;
    }
    async execute({ images, watermarkText, }) {
        console.log('### TransformImagesUseCase');
        for (const image of images) {
            const jobData = {
                imagePath: image.path,
                watermarkText,
                outputImagesDir: this.outputImagesDir,
                imageId: image.id,
            };
            imageTransformationQueue.add('transform-image', jobData);
        }
    }
}
//# sourceMappingURL=transform-images.use-case.js.map