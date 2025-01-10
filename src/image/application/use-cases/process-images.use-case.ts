import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case";
import { CategorizeImagesUseCase } from "./categorize-images.use-case";
import { TransformImagesUseCase } from "./transform-images.use-case";
import { DetectObjectsUseCase } from "./detect-objects.use-case";
import { ReadImagesNamesUseCase } from "./read-images-names.use-case";
import dotenv from 'dotenv';
import { SaveObjectPredictionsIntoImageUseCase } from "./draw-objects-into-image.use-case";

dotenv.config();

export class ProcessImagesUseCase {
  readImagesNamesUseCase: ReadImagesNamesUseCase;
  categorizeImagesUseCase: CategorizeImagesUseCase;
  createImagesInDbUseCase: CreateImagesInDbUseCase;
  transformImagesUseCase: TransformImagesUseCase;
  detectObjectsUseCase: DetectObjectsUseCase;
  saveObjectPredictionsIntoImageUseCase: SaveObjectPredictionsIntoImageUseCase;

  constructor() {
    this.readImagesNamesUseCase = new ReadImagesNamesUseCase();
    this.categorizeImagesUseCase = new CategorizeImagesUseCase()
    this.createImagesInDbUseCase = new CreateImagesInDbUseCase()
    this.transformImagesUseCase = new TransformImagesUseCase()
    this.detectObjectsUseCase = new DetectObjectsUseCase()
  }

  async execute() {
    const imagesFilesNames = await this.readImagesNamesUseCase.execute()

    if (!imagesFilesNames) {
      return
    }

    const images = await this.createImagesInDbUseCase.execute(imagesFilesNames)

    // ### TODO: do only one loop?
    this.categorizeImagesUseCase.execute(images)
    this.transformImagesUseCase.execute({
      images,
      watermarkText: 'Albert Montolio'
    })

    this.detectObjectsUseCase.execute(images);
  }
}