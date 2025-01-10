import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { Image } from '@prisma/client';
import { CatejorizationJobData } from '../../infraestructure/types/categorization.job-data';
import path from 'path';
import { inputImagesDir } from '../../config';
import { CategorizeImagesUseCaseError } from '../../domain/errors/categorize-images.use-case.error';
import { ImageCategorizationQueue } from 'src/image/infraestructure/queues/image-categorization.queue';

export class CategorizeImagesUseCase {
  logRepository: LogRepository;
  imageCategorizationQueue: ImageCategorizationQueue;

  constructor() {
    this.logRepository = new LogRepository()
    this.imageCategorizationQueue = ImageCategorizationQueue.getInstance()
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
    try {
      const jobData: CatejorizationJobData = {
        imagePath,
        imageId,
      };

      await this.imageCategorizationQueue.add('categorize-image', jobData);
    } catch (err) {
      throw new CategorizeImagesUseCaseError();
    }
  }
}
