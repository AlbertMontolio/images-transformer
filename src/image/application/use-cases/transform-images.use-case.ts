import { Image } from "@prisma/client";
import { imageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue.js"
import { TransformationJobData } from "../../infraestructure/types/transformation.job-data.js";

export class TransformImagesUseCase {
  constructor(
    private readonly outputImagesDir: string,
  ) {}

  async execute({
    images,
    watermarkText,
  }: {
    images: Image[];
    watermarkText: string;
  }) {
    console.log('### TransformImagesUseCase')
    for (const image of images) {
      const jobData: TransformationJobData = {
        imagePath: image.path,
        watermarkText,
        outputImagesDir: this.outputImagesDir,
        imageId: image.id,
      }
      imageTransformationQueue.add('transform-image', jobData)
    }
  }
}
