import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case";
import { CategorizeImagesUseCase } from "./categorize-images.use-case";
import { TransformImagesUseCase } from "./transform-images.use-case";
import { DetectObjectsUseCase } from "./detect-objects.use-case";
import { ReadImagesNamesUseCase } from "./read-images-names.use-case";
import { SaveObjectPredictionsIntoImageUseCase } from "./draw-objects-into-image.use-case";
import { ImageCategorizationQueue } from "src/image/infraestructure/queues/image-categorization.queue";
import { ImageTransformationQueue } from "src/image/infraestructure/queues/image-transformation.queue";
import { ImageDetectionQueue } from "src/image/infraestructure/queues/image-detection.queue";

export class ProcessImagesUseCase {
  readImagesNamesUseCase: ReadImagesNamesUseCase;
  categorizeImagesUseCase: CategorizeImagesUseCase;
  createImagesInDbUseCase: CreateImagesInDbUseCase;
  transformImagesUseCase: TransformImagesUseCase;
  detectObjectsUseCase: DetectObjectsUseCase;
  saveObjectPredictionsIntoImageUseCase: SaveObjectPredictionsIntoImageUseCase;
  private readonly imageCategorizationQueue: ImageCategorizationQueue;
  private readonly imageTransformationQueue: ImageTransformationQueue;
  private readonly imageDetectionQueue: ImageDetectionQueue;

  constructor() {
    this.readImagesNamesUseCase = new ReadImagesNamesUseCase();
    this.categorizeImagesUseCase = new CategorizeImagesUseCase()
    this.createImagesInDbUseCase = new CreateImagesInDbUseCase()
    this.transformImagesUseCase = new TransformImagesUseCase()
    this.detectObjectsUseCase = new DetectObjectsUseCase()

    this.imageCategorizationQueue = ImageCategorizationQueue.getInstance()
    this.imageTransformationQueue = ImageTransformationQueue.getInstance()
    this.imageDetectionQueue = ImageDetectionQueue.getInstance()
  }

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
