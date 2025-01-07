import { CreateImagesInDbUseCase } from "./create-images-in-db.use-case.js";
import { ReadImagesUseCase } from "./read-images.use-case.js";
import { CategorizeImagesUseCase } from "./categorize-images.use-case.js";
import { TransformImagesUseCase } from "./transform-images.use-case.js";
import { DetectObjectsUseCase } from "./detect-objects.use-case.js";

export class ProcessImagesUseCase {
  readImagesUseCase: ReadImagesUseCase;
  categorizeImagesUseCase: CategorizeImagesUseCase;
  createImagesInDbUseCase: CreateImagesInDbUseCase;
  transformImagesUseCase: TransformImagesUseCase;
  detectObjectsUseCase: DetectObjectsUseCase;

  constructor(
    private readonly inputImagesDir: string,
    private readonly outputImagesDir: string,
  ) {
    this.readImagesUseCase = new ReadImagesUseCase(this.inputImagesDir);
    this.categorizeImagesUseCase = new CategorizeImagesUseCase()
    this.createImagesInDbUseCase = new CreateImagesInDbUseCase()
    this.transformImagesUseCase = new TransformImagesUseCase(this.outputImagesDir)
    this.detectObjectsUseCase = new DetectObjectsUseCase()
  }

  async execute() {
    const imagesPaths = await this.readImagesUseCase.execute()
    console.log('### imagesPaths', imagesPaths)

    const images = await this.createImagesInDbUseCase.execute(imagesPaths)
    console.log('### images', images)
    this.categorizeImagesUseCase.execute(images)
    this.transformImagesUseCase.execute({
      images,
      watermarkText: 'Albert Montolio'
    })

    this.detectObjectsUseCase.execute(images);
  }
}