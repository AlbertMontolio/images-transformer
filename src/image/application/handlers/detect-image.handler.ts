import { DetectObjectsService } from 'src/image/infraestructure/services/detect-objects.service';
import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { DetectImageCommand } from '../commands/detect-image.command';

export class DetectImageHandler {
  constructor(
    private readonly detectObjectsService: DetectObjectsService,
    private readonly logRepository: LogRepository
  ) {}

  async execute(command: DetectImageCommand): Promise<void> {
    const { image } = command;

    await this.logRepository.create({ imageId: image.id, status: 'detection-started' });

    await this.detectObjectsService.execute(image);

    await this.logRepository.create({ imageId: image.id, status: 'detection-finished' });
  }
} 