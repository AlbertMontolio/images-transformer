import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { ImageRepository } from '../../infraestructure/repositories/image.repository';
import { injectable } from 'tsyringe';
import { Status } from '@prisma/client';


@injectable()
export class ImageProcessingStatsService {
  constructor(
    private readonly logRepository: LogRepository,
    private readonly imageRepository: ImageRepository,
  ) {}

  async getImagesProcessingTimes() {
    // ### TODO: get from prisma enums
    const processNames: string[] = ['transformation', 'categorization', 'object_detection', 'transformation_storage'];
    const images = await this.imageRepository.findAll();

    const processNamesMap = processNames.reduce((acc, name) => {
      acc[name] = 0;
      return acc;
    }, {});

    // TODO: use map
    // const hashMap = new Map(processNames.map((name, index) => [name, index]));


    for (const image of images) {
      for (const processName of processNames) {
        const duration = await this.getProcessingDuration(image.id, processName);
        processNamesMap[processName] += duration;
      }
    }

    return processNamesMap;
  }

  private async getProcessingDuration(imageId: number, processName: string): Promise<number | null> {
    const [startedLog, completedLog] = await Promise.all([
      this.logRepository.findByImageIdAndStatusAndProcessName({
        imageId,
        processName,
        status: Status.STARTED,
      }),
      this.logRepository.findByImageIdAndStatusAndProcessName({
        imageId,
        processName,
        status: Status.COMPLETED,
      }),
    ]);

    const duration = startedLog && completedLog
      ? completedLog.createdAt.getTime() - startedLog.createdAt.getTime()
      : null;

    const durationInSeconds = duration ? duration / 1000 : 0;

    return durationInSeconds;
  }
} 