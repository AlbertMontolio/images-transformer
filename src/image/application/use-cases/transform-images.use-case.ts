import { Image } from "@prisma/client";
import path from 'path';
import { inputImagesDir } from "../../config";
import { ImageTransformationJobData, ImageTransformationQueue } from "src/image/infraestructure/queues/image-transformation.queue";

export class TransformImagesUseCase {
  imageTransformationQueue: ImageTransformationQueue;

  constructor() {
    this.imageTransformationQueue = ImageTransformationQueue.getInstance()
  }
  async execute({
    images,
    watermarkText,
  }: {
    images: Image[];
    watermarkText: string;
  }) {
    for (const image of images) {
      const inputPath = inputImagesDir
      const imagePath = path.join(inputPath, image.name)
      const jobData: ImageTransformationJobData = {
        imagePath: imagePath,
        imageName: image.name,
        watermarkText,
        imageId: image.id,
      }
      this.imageTransformationQueue.add('transform-image', jobData)
    }
  }
}
