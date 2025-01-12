import { injectable, inject } from 'tsyringe';
import { ReadImagesNamesUseCase } from "./read-images-names.use-case";
import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case";
import { ImageCategorizationQueue } from "../../infraestructure/queues/image-categorization.queue";
import { ImageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue";
import { ImageDetectionQueue } from "../../infraestructure/queues/image-detection.queue";
import { INJECTION_TOKENS } from '../../../shared/injection-tokens';
import { inputImagesDir } from '../../config';
import { ImageRepository } from '../../infraestructure/repositories/image.repository';

@injectable()
export class ProcessImagesUseCase {
  private readonly BATCH_SIZE = 5; // Adjust based on your needs
  
  constructor(
    @inject(ReadImagesNamesUseCase) 
    private readonly readImagesNamesUseCase: ReadImagesNamesUseCase,
    
    @inject(ImageRepository)
    private readonly imageRepository: ImageRepository,

    @inject(CreateImagesInDbUseCase)
    private readonly createImagesInDbUseCase: CreateImagesInDbUseCase,
    
    @inject(INJECTION_TOKENS.IMAGE_CATEGORIZATION_QUEUE)
    private readonly imageCategorizationQueue: ImageCategorizationQueue,
    
    @inject(INJECTION_TOKENS.IMAGE_TRANSFORMATION_QUEUE)
    private readonly imageTransformationQueue: ImageTransformationQueue,
    
    @inject(INJECTION_TOKENS.IMAGE_DETECTION_QUEUE)
    private readonly imageDetectionQueue: ImageDetectionQueue
  ) {}

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async execute() {
    const inputPath = inputImagesDir
    const imagesFilesNames = await this.readImagesNamesUseCase.execute(inputPath)

    if (!imagesFilesNames) {
      return
    }

    const fileNameBatches = this.createBatches(imagesFilesNames, this.BATCH_SIZE);

    for (const fileNameBatch of fileNameBatches) {
      await this.createImagesInDbUseCase.executeMany(fileNameBatch);
      const images = await this.imageRepository.findAll();
      
      await Promise.all([
        this.imageCategorizationQueue.addBulk(
          images.map(image => ({
            name: 'categorize-image',
            data: image
          }))
        ),
        this.imageTransformationQueue.addBulk(
          images.map(image => ({
            name: 'transform-image',
            data: image
          }))
        ),
        this.imageDetectionQueue.addBulk(
          images.map(image => ({
            name: 'detect-objects',
            data: image
          }))
        )
      ]);
    }
  }
}
