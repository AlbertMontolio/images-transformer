import { Image } from "@prisma/client";
import sharp from 'sharp';
import path from 'path';
import { inputImagesDir, outputImagesDir } from "../../config";
import { DetectedObjectPrediction } from "../../infraestructure/services/detect-objects.service";
import { SavePredictionError } from "../../domain/errors/save-prediction.error";
import { ErrorRepository } from "src/image/infraestructure/repositories/error.repository";
import { ProcessName } from "../../utils/constants";

export class SaveObjectPredictionsIntoImageUseCase {
  constructor(private readonly errorRepository: ErrorRepository) {}
  async execute(image: Image, predictions: DetectedObjectPrediction[] | undefined) {
    if (!predictions || predictions.length === 0) {
      return;
    }

    const imagePath = path.join(inputImagesDir, image.name);
    const originalWidth = image.width;
    const originalHeight = image.height;

    try {
      const svgRectangles = this.createRectangles(predictions);

      const svgImage = `
        <svg width="${originalWidth}" height="${originalHeight}">
          ${svgRectangles}
        </svg>
      `;

      const fileName = image.name;
      const outputFilePath = path.join(outputImagesDir, 'detected_images', fileName);

      await sharp(imagePath)
        .composite([{ input: Buffer.from(svgImage), top: 0, left: 0 }])
        .toFile(outputFilePath);
    } catch (err) {
      // create an error instance with traceId
      // pass traceId to the error
      this.errorRepository.create({
        message: err.message,
        stack: err.stack,
        imageId: image.id,
        processName: ProcessName.DETECTION
      });
      throw new SavePredictionError('Failed to save predictions on image', err);
    }
  }

  private createRectangles(detectedObjects: DetectedObjectPrediction[]) {
    return detectedObjects
      .map((prediction) => {
        const { bbox, class: className, score } = prediction;
        const [x, y, width, height] = bbox;

        return `
          <rect 
            x="${x}" 
            y="${y}" 
            width="${width}" 
            height="${height}" 
            fill="none" 
            stroke="red" 
            stroke-width="20"
          />
          <text 
            x="${x}" 
            y="${y - 5}" 
            fill="red" 
            font-size="200" 
            font-family="Arial"
          >
            ${className} (${(score * 100).toFixed(1)}%)
          </text>
        `;
      })
      .join('');
  }
}