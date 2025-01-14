import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { CategorizeImageService } from 'src/image/infraestructure/services/categorize-image.service';
import { CategorizeImageCommand } from '../commands/categorize-image.command';
import { CategorizationRepository, CreateCategorizationProp } from 'src/image/infraestructure/repositories/categorization.repository';
import { ProcessStatus } from '@prisma/client';

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
      status: ProcessStatus.STARTED
    });

    const predictions = await this.categorizeImageService.execute(image);

    await this.logRepository.create({
      imageId: image.id,
      processName: 'categorization',
      status: ProcessStatus.COMPLETED
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
