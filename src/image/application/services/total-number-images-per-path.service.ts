import { injectable } from "tsyringe";
import { inputImagesDir, outputImagesDir } from "../../config";
import { ReadImagesNamesUseCase } from "../use-cases/read-images-names.use-case";
import path from "path";

@injectable()
export class TotalNumberImagesPerPathService {
  constructor(private readonly readImagesNamesUseCase: ReadImagesNamesUseCase) {}

  async execute() {
    const inputPath = inputImagesDir
    const inputImages = await this.readImagesNamesUseCase.execute(inputPath);
    const inputImagesTotal = inputImages.length;

    // ### TODO: improve this naming strategy
    const outputPath = outputImagesDir
    const transformedOutputPath = path.join(outputPath, 'transformed_images')
    const detectedOutputPath = path.join(outputPath, 'detected_images')

    const transformedImages = await this.readImagesNamesUseCase.execute(transformedOutputPath);
    const detectedImages = await this.readImagesNamesUseCase.execute(detectedOutputPath);

    const outputImagesTotal = {
      transformedImagesTotal: transformedImages.length,
      detectedImagesTotal: detectedImages.length,
    }

    return {
      inputImagesTotal,
      outputImagesTotal,
    }
  }
}