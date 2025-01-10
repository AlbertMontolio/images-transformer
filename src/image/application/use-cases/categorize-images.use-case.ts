import { imageCategorizationQueue } from '../../infraestructure/queues/image-categorization.queue';
import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { Image } from '@prisma/client';
import { CatejorizationJobData } from '../../infraestructure/types/categorization.job-data';
import path from 'path';
import { inputImagesDir } from '../../config';
import { CategorizeImagesUseCaseError } from '../../domain/errors/categorize-images.use-case.error';

export class CategorizeImagesUseCase {
  logRepository: LogRepository;

  constructor() {
    this.logRepository = new LogRepository()
  }

  async execute(images: Image[]) {
    for (const image of images) {
      const imageId = image.id
      const imageName = image.name
      const imagePath = path.join(inputImagesDir, imageName);
      await this.categorizeImage({ imagePath, imageId })
    }
  }

  private async categorizeImage({
    imagePath,
    imageId,
  }: {
    imagePath: string;
    imageId: number;
  }) {
    console.log('### ccc imageCategorizationQueue.add', imageCategorizationQueue.add)
    try {
      const jobData: CatejorizationJobData = {
        imagePath,
        imageId,
      };

      await imageCategorizationQueue.add('process-image', jobData);
      await this.logRepository.create({
        imageId,
        status: 'sent-to-queue'
      })
    } catch (err) {
      throw new CategorizeImagesUseCaseError();
    }
  }
}
