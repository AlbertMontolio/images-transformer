import { LogRepository, ProcessName } from '../../infraestructure/repositories/log.repository';
import { ImageRepository } from '../../infraestructure/repositories/image.repository';
import { injectable } from 'tsyringe';


@injectable()
export class ImageProcessingStatsService {
  constructor(
    private readonly logRepository: LogRepository,
    private readonly imageRepository: ImageRepository,
  ) {}

  async getImagesProcessingTimes() {
    // ### TODO: get from prisma enums
    const processNames: ProcessName[] = ['transformation', 'categorization', 'object_detection', 'transformation_storage'];
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

  private async getProcessingDuration(imageId: number, processName: ProcessName): Promise<number | null> {
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