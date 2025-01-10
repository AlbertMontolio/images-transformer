import { DetectedObject } from "@prisma/client";
import sharp from 'sharp';
import path from 'path';
import { inputImagesDir, outputImagesDir } from "../../config";
import { ImageWithRelations } from "src/image/domain/interfaces/image-with-relations";

export class DrawObjectsIntoImageUseCase {
  async execute(image: ImageWithRelations) {
    const imagePath = path.join(inputImagesDir, image.name);

    const detectedObjects = image.detectedObjects

    const originalWidth = image.width;
    const originalHeight = image.height;

    const svgRectangles = this.createRectangles(detectedObjects)

    const svgImage = `
      <svg width="${originalWidth}" height="${originalHeight}">
        ${svgRectangles}
      </svg>
    `;

    const fileName = image.name;
    const outputFilePath = path.join(outputImagesDir, 'detected_images', fileName); // Create output file path

    // Overlay the SVG on the Original Image
    await sharp(imagePath)
      .composite([{ input: Buffer.from(svgImage), top: 0, left: 0 }])
      .toFile(outputFilePath);
  }

  private createRectangles(detectedObjects: DetectedObject[]) {
    const svgRects = detectedObjects
      .map((prediction) => {
        const {x, y, width, height} = prediction;
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
            ${prediction.class} (${(prediction.score * 100).toFixed(1)}%)
          </text>
        `;
      })
      .join('');

    return svgRects;
  }
}