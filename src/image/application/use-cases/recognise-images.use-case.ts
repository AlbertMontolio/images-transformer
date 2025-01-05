import { imageRecognitionQueue } from '../../infraestructure/queues/image-recognition.queue.js';
import { LogRepository } from '../../infraestructure/repositories/log.repository.js';
import { Image } from '@prisma/client';

export class RecogniseImagesUseCase {
  constructor() {}

  async execute(images: Image[]) {
    for (const image of images) {
      const imageId = image.id
      const imagePath = image.path
      this.recogniseImage({ imagePath, imageId })
    }
  }

  private async recogniseImage({
    imagePath,
    imageId,
  }: {
    imagePath: string;
    imageId: number;
  }) {
    try {
      const jobData = {
        imagePath,
        imageId,
      };

      console.log('### adding jobData to queue')
      await imageRecognitionQueue.add('process-image', jobData);
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
