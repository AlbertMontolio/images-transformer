import { imageCategorizationQueue } from '../../infraestructure/queues/image-categorization.queue.js';
import { LogRepository } from '../../infraestructure/repositories/log.repository.js';
import { Image } from '@prisma/client';
import { CatejorizationJobData } from '../../infraestructure/types/categorization.job-data.js';
import path from 'path';
import { inputImagesDir } from '../../config.js';

export class CategorizeImagesUseCase {
  constructor() {}

  async execute(images: Image[]) {
    for (const image of images) {
      const imageId = image.id
      const imagePath = image.path
      const imageName = image.name
      this.categorizeImage({ imageName, imageId })
    }
  }

  private async categorizeImage({
    imageName,
    imageId,
  }: {
    imageName: string;
    imageId: number;
  }) {
    try {
      const inputPath = inputImagesDir
      console.log('### ciuc inputPath', inputPath)
      const imagePath = path.join(inputPath, imageName);
      const jobData: CatejorizationJobData = {
        imagePath,
        imageId,
      };

      console.log('### adding jobData to queue')
      await imageCategorizationQueue.add('process-image', jobData);
      const logRepository = new LogRepository()
      await logRepository.create({
        imageId,
        status: 'sent-to-queue'
      })
    } catch (err) {
      console.error('Error during classification:', err);
    }
    return true;
  }
}
