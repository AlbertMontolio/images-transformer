import { TransformImageCommand } from '../commands/transform-image.command';
import { TransformImageService } from '../../infraestructure/services/transform-image.service';
import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { SaveImageInFolderService } from 'src/image/infraestructure/services/save-image-in-folder.service';

export class TransformImageHandler {
  constructor(
    private readonly transformImageService: TransformImageService,
    private readonly logRepository: LogRepository,
    private readonly saveImageInFolderService: SaveImageInFolderService
  ) {}

  async execute(command: TransformImageCommand): Promise<void> {
    const { image, watermarkText } = command;

    await this.logRepository.create({
      imageId: image.id,
      processName: 'transformation',
      status: 'started'
    });

    const sharpImage = await this.transformImageService.execute({
      image,
      watermarkText,
    });

    await this.logRepository.create({
      imageId: image.id,
      processName: 'transformation',
      status: 'completed'
    });

    await this.saveImageInFolderService.execute(sharpImage, image.name);
  }
} 
