import { injectable, inject } from 'tsyringe';
import { Sharp } from 'sharp';
import { TransformImageCommand } from '../commands/transform-image.command';
import { TransformImageService } from '../../infraestructure/services/transform-image.service';
import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { RedisPublisherService } from '../../../shared/services/redis-publisher.service';


// @injectable()
export class TransformImageHandler {
  constructor(
    private readonly transformImageService: TransformImageService,
    private readonly logRepository: LogRepository
  ) {}

  async execute(command: TransformImageCommand): Promise<Sharp> {
    const { image, watermarkText } = command;

    try {
      await this.logRepository.createStartedProcessLog(image.id, 'transformation');

      const transformedImage = await this.transformImageService.execute({
        image,
        watermarkText,
      });

      await this.logRepository.createCompletedProcessLog(image.id, 'transformation');
      console.log('')

      // Publish progress through Redis
      await RedisPublisherService.getInstance().publish({
        type: 'transformation-progress',
        data: {
          imageId: image.id,
          status: 'completed',
          image,
        }
      });
      
      return transformedImage;
    } catch (error) {
      console.error('Error transforming image:', error);
    }
  }
} 
