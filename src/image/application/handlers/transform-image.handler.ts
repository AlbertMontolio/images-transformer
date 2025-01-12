import { TransformImageCommand } from '../commands/transform-image.command';
import { TransformImageService } from '../../infraestructure/services/transform-image.service';
import { LogRepository } from '../../infraestructure/repositories/log.repository';

export class TransformImageHandler {
  constructor(
    private readonly transformImageService: TransformImageService,
    private readonly logRepository: LogRepository
  ) {}

  async execute(command: TransformImageCommand): Promise<void> {
    const { image, watermarkText } = command;

    await this.logRepository.create({
      imageId: image.id,
      processName: 'transformation',
      status: 'started'
    });

    await this.transformImageService.execute({
      image,
      watermarkText,
    });

    await this.logRepository.create({
      imageId: image.id,
      processName: 'transformation',
      status: 'completed'
    });
  }
} 
