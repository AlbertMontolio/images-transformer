import { TransformImageCommand } from '../commands/transform-image.command';
import { TransformImageService } from '../../infraestructure/services/transform-image.service';
import { LogRepository } from '../../infraestructure/repositories/log.repository';

export class TransformImageHandler {
  constructor(
    private readonly transformImageService: TransformImageService,
    private readonly logRepository: LogRepository
  ) {}

  async execute(command: TransformImageCommand): Promise<void> {
    const { imagePath, watermarkText, imageId, imageName } = command;

    await this.logRepository.create({ imageId, status: 'transformation-started' });

    await this.transformImageService.execute({
      imagePath,
      imageName,
      watermarkText,
      imageId,
    });

    await this.logRepository.create({ imageId, status: 'transformation-finished' });
  }
} 