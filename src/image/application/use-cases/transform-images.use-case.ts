import { Image } from "@prisma/client";
import { imageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue"
import { TransformationJobData } from "../../infraestructure/types/transformation.job-data";
import path from 'path';
import { inputImagesDir } from "../../config";

export class TransformImagesUseCase {
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
      const jobData: TransformationJobData = {
        imagePath: imagePath,
        imageName: image.name,
        watermarkText,
        imageId: image.id,
      }
      imageTransformationQueue.add('transform-image', jobData)
    }
  }
}
