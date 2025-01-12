import { LogRepository } from '../../infraestructure/repositories/log.repository';
import { CategorizeImageService } from 'src/image/infraestructure/services/categorize-image.service';
import { CategorizeImageCommand } from '../commands/categorize-image.command';
import { CategorizationRepository, CreateCategorizationProp } from 'src/image/infraestructure/repositories/categorization.repository';

export class CategorizeImageHandler {
  constructor(
    private readonly categorizeImageService: CategorizeImageService,
    private readonly logRepository: LogRepository,
    private readonly categorizationRepository: CategorizationRepository
  ) {}

  async execute(command: CategorizeImageCommand): Promise<void> {
    const { image } = command;

    await this.logRepository.create({ imageId: image.id, status: 'categorization-started' });

    const predictions = await this.categorizeImageService.execute(image);

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

    await this.logRepository.create({ imageId: image.id, status: 'categorization-finished' });
  }
} 