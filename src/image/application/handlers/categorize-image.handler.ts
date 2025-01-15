import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { CategorizeImageService } from 'src/image/infraestructure/services/categorize-image.service';
import { CategorizeImageCommand } from '../commands/categorize-image.command';
import { CategorizationRepository, CreateCategorizationProp } from 'src/image/infraestructure/repositories/categorization.repository';
import { Status } from '@prisma/client';
import { RedisPublisherService } from '../../../shared/services/redis-publisher.service';

export class CategorizeImageHandler {
  constructor(
    private readonly categorizeImageService: CategorizeImageService,
    private readonly logRepository: LogRepository,
    private readonly categorizationRepository: CategorizationRepository
  ) {}

  async execute(command: CategorizeImageCommand): Promise<void> {
    const { image } = command;

    await this.logRepository.create({
      imageId: image.id,
      processName: 'categorization',
      status: Status.STARTED
    });

    // TODO: add error handling
    const predictions = await this.categorizeImageService.execute(image);

    // Publish progress through Redis
    RedisPublisherService.getInstance().publish({
      type: 'categorization-progress',
      data: {
        imageId: image.id,
        status: 'completed',
        image,
      }
    });

    await this.logRepository.create({
      imageId: image.id,
      processName: 'categorization',
      status: Status.COMPLETED
    });

    const inputs: CreateCategorizationProp[] = predictions.map((prediction) => {
      return {
        label: prediction.className,
        score: prediction.probability,
      }
    })
    await this.categorizationRepository.createMany({
      inputs,
      imageId: image.id,
    })
  }
} 
