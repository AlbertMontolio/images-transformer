import { DetectObjectsService } from 'src/image/infraestructure/services/detect-objects.service';
import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { DetectImageCommand } from '../commands/detect-image.command';
import { SaveObjectPredictionsIntoImageUseCase } from '../use-cases/save-object-predictions-into-image.use-case';
import { DetectedObjectRepository } from 'src/image/infraestructure/repositories/detected-object.repository';
import { Status } from '@prisma/client';

export class DetectImageHandler {
  constructor(
    private readonly detectObjectsService: DetectObjectsService,
    private readonly logRepository: LogRepository,
    private readonly saveObjectPredictionsIntoImageUseCase: SaveObjectPredictionsIntoImageUseCase,
    private readonly detectedObjectRepository: DetectedObjectRepository
  ) {}

  async execute(command: DetectImageCommand): Promise<void> {
    const { image } = command;

    await this.logRepository.create({
      imageId: image.id,
      processName: 'object_detection',
      status: Status.STARTED
    });

    const predictions = await this.detectObjectsService.execute(image);

    await this.logRepository.create({
      imageId: image.id,
      processName: 'object_detection',
      status: Status.COMPLETED
    });

    await this.saveObjectPredictionsIntoImageUseCase.execute(image, predictions);

    for (const prediction of predictions) {
      const [x, y, width, height] = prediction.bbox;
      const detectedObject = {
        x,
        y,
        width,
        height,
        class: prediction.class,
        score: prediction.score,
      }
      await this.detectedObjectRepository.create(detectedObject, image.id);
    }
  }
} 