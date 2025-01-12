import { injectable } from 'tsyringe';
import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { ImageRepository } from '../../infraestructure/repositories/image.repository';

type ProcessName = 'object_detection' | 'transformation' | 'categorization';

@injectable()
export class GetStatsUseCase {
  constructor(
    private readonly logRepository: LogRepository,
    private readonly imageRepository: ImageRepository,
  ) {}

  async execute() {
    const processingTimes = await this.getImagesProceessingTimes()

    const results = {
      processingTimes
    }
    return results;
  }

  async getImagesProceessingTimes() {
    const images = await this.imageRepository.findAll();
    const imageTransformationDurations = [];
    const imageCategorizationDurations = [];
    const imageObjectDetectionDurations = [];

    for (const image of images) {
      const imageTransformationDuration = await this.getProcessingDuration(image.id, 'transformation');
      const imageCategorizationDuration = await this.getProcessingDuration(image.id, 'categorization');
      const imageObjectDetectionDuration = await this.getProcessingDuration(image.id, 'object_detection');

      imageTransformationDurations.push(imageTransformationDuration);
      imageCategorizationDurations.push(imageCategorizationDuration);
      imageObjectDetectionDurations.push(imageObjectDetectionDuration);
    }

    const imagesTransformationsTotal = imageTransformationDurations.reduce((acc, curr) => acc + curr, 0);
    const imagesCategorizationsTotal = imageCategorizationDurations.reduce((acc, curr) => acc + curr, 0);
    const imagesObjectDetectionsTotal = imageObjectDetectionDurations.reduce((acc, curr) => acc + curr, 0);

    return {
      imagesTransformationsTotal,
      imagesCategorizationsTotal,
      imagesObjectDetectionsTotal,
    };
  }

  async getProcessingDuration(imageId: number, processName: ProcessName): Promise<number | null> {
    const [startedLog, completedLog] = await Promise.all([
      this.logRepository.findByImageIdAndStatusAndProcessName({
        imageId,
        processName,
        status: 'started',
      }),
      this.logRepository.findByImageIdAndStatusAndProcessName({
        imageId,
        processName,
        status: 'completed',
      }),
    ]);

    const duration = startedLog && completedLog
      ? completedLog.createdAt.getTime() - startedLog.createdAt.getTime()
      : null;

    const durationInSeconds = duration ? duration / 1000 : 0;

    return durationInSeconds;
  }
}
