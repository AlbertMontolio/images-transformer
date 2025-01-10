import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case";
import { ReadImagesUseCase } from "./read-images.use-case";
import { CategorizeImagesUseCase } from "./categorize-images.use-case";
import { TransformImagesUseCase } from "./transform-images.use-case";
import { DetectObjectsUseCase } from "./detect-objects.use-case";
import { ReadImagesNamesUseCase } from "./read-images-names.use-case";
import path from 'path';
import dotenv from 'dotenv';
import { hostInputImagesDir } from "../../config";
dotenv.config();

export class ProcessImagesUseCase {
  readImagesUseCase: ReadImagesUseCase;
  readImagesNamesUseCase: ReadImagesUseCase;
  categorizeImagesUseCase: CategorizeImagesUseCase;
  createImagesInDbUseCase: CreateImagesInDbUseCase;
  transformImagesUseCase: TransformImagesUseCase;
  detectObjectsUseCase: DetectObjectsUseCase;

  constructor() {
    this.readImagesUseCase = new ReadImagesUseCase();
    this.readImagesNamesUseCase = new ReadImagesNamesUseCase();
    this.categorizeImagesUseCase = new CategorizeImagesUseCase()
    this.createImagesInDbUseCase = new CreateImagesInDbUseCase()
    this.transformImagesUseCase = new TransformImagesUseCase()
    this.detectObjectsUseCase = new DetectObjectsUseCase()
  }

  async execute() {
    // const imagesPaths = await this.readImagesUseCase.execute()
    // console.log('### imagesPaths', imagesPaths)

    const imagesFilesNames = await this.readImagesNamesUseCase.execute()
    console.log('### piuc imagesFilesNames', imagesFilesNames)
    const localImagesPaths = imagesFilesNames.map((imageFileName) => {
      return path.join(hostInputImagesDir, imageFileName);
    })
    console.log('### localImagesPaths', localImagesPaths)
    console.log('### process.env', process.env)

    const images = await this.createImagesInDbUseCase.execute(imagesFilesNames)
    console.log('### images', images)
    this.categorizeImagesUseCase.execute(images)
    this.transformImagesUseCase.execute({
      images,
      watermarkText: 'Albert Montolio'
    })

    this.detectObjectsUseCase.execute(images);
  }
}