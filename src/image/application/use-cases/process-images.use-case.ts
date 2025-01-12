import { injectable, inject } from 'tsyringe';
import { ReadImagesNamesUseCase } from "./read-images-names.use-case";
import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case";
import { ImageCategorizationQueue } from "../../infraestructure/queues/image-categorization.queue";
import { ImageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue";
import { ImageDetectionQueue } from "../../infraestructure/queues/image-detection.queue";
import { INJECTION_TOKENS } from '../../../shared/injection-tokens';

@injectable()
export class ProcessImagesUseCase {
  constructor(
    @inject(ReadImagesNamesUseCase) 
    private readonly readImagesNamesUseCase: ReadImagesNamesUseCase,
    
    @inject(CreateImagesInDbUseCase)
    private readonly createImagesInDbUseCase: CreateImagesInDbUseCase,
    
    @inject(INJECTION_TOKENS.IMAGE_CATEGORIZATION_QUEUE)
    private readonly imageCategorizationQueue: ImageCategorizationQueue,
    
    @inject(INJECTION_TOKENS.IMAGE_TRANSFORMATION_QUEUE)
    private readonly imageTransformationQueue: ImageTransformationQueue,
    
    @inject(INJECTION_TOKENS.IMAGE_DETECTION_QUEUE)
    private readonly imageDetectionQueue: ImageDetectionQueue
  ) {}

  async execute() {
    const imagesFilesNames = await this.readImagesNamesUseCase.execute()

    if (!imagesFilesNames) {
      return
    }

    const images = await this.createImagesInDbUseCase.execute(imagesFilesNames)

    for (const image of images) {
      await this.imageTransformationQueue.add('transform-image', image);
      await this.imageCategorizationQueue.add('categorize-image', image);
      await this.imageDetectionQueue.add('detect-objects', image);
    }
  }
}
