import { Image } from "@prisma/client";
import { imageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue.js"
import { TransformationJobData } from "../../infraestructure/types/transformation.job-data.js";
import path from 'path';
import { inputImagesDir } from "../../config.js";

export class TransformImagesUseCase {
  async execute({
    images,
    watermarkText,
  }: {
    images: Image[];
    watermarkText: string;
  }) {
    console.log('### TransformImagesUseCase')
    for (const image of images) {
      const inputPath = inputImagesDir
      const imagePath = path.join(inputPath, image.name)
      console.log('### tiuc imagePath', imagePath)
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
