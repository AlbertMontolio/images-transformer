import { TransformImageCommand } from '../commands/transform-image.command';
import { TransformImageService } from '../../infraestructure/services/transform-image.service';
import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { SaveImageInFolderService } from 'src/image/infraestructure/services/save-image-in-folder.service';
import { Sharp } from 'sharp';

export class TransformImageHandler {
  private static readonly BATCH_SIZE = 10;
  private batch: { image: Sharp; filename: string }[] = [];

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
    console.log('');

    this.batch.push({ image: sharpImage, filename: image.name });

    if (this.batch.length >= TransformImageHandler.BATCH_SIZE) {
      await this.logRepository.create({
        imageId: image.id,
        processName: 'transformation_storage',
        status: 'started'
      });

      await this.saveImageInFolderService.executeMany([...this.batch]);

      await this.logRepository.create({
        imageId: image.id,
        processName: 'transformation_storage',
        status: 'completed'
      });
      console.log('');

      this.batch = []; // Clear the batch
    }
  }

  // Method to flush remaining images
  async flushBatch(): Promise<void> {
    if (this.batch.length > 0) {
      await this.saveImageInFolderService.executeMany([...this.batch]);
      this.batch = [];
    }
  }
} 
