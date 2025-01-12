import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case";
import { ReadImagesNamesUseCase } from "./read-images-names.use-case";
import { SaveObjectPredictionsIntoImageUseCase } from "./save-object-predictions-into-image.use-case";
import { ImageCategorizationQueue } from "../../infraestructure/queues/image-categorization.queue";
import { ImageTransformationQueue } from "../../infraestructure/queues/image-transformation.queue";
import { ImageDetectionQueue } from "../../infraestructure/queues/image-detection.queue";

export class ProcessImagesUseCase {
  readImagesNamesUseCase: ReadImagesNamesUseCase;
  createImagesInDbUseCase: CreateImagesInDbUseCase;
  saveObjectPredictionsIntoImageUseCase: SaveObjectPredictionsIntoImageUseCase;
  private readonly imageCategorizationQueue: ImageCategorizationQueue;
  private readonly imageTransformationQueue: ImageTransformationQueue;
  private readonly imageDetectionQueue: ImageDetectionQueue;

  constructor() {
    this.readImagesNamesUseCase = new ReadImagesNamesUseCase();
    this.createImagesInDbUseCase = new CreateImagesInDbUseCase()

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
