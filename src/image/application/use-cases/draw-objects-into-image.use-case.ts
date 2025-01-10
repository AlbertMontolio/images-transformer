import { DetectedObject } from "@prisma/client";
import { ImageRepository } from "../../infraestructure/repositories/image.repository"
import sharp from 'sharp';
import path from 'path';
import { inputImagesDir, outputImagesDir } from "../../config";

export class DrawObjectsIntoImageUseCase {
  imageRepository: ImageRepository;

  constructor () {
    this.imageRepository = new ImageRepository()
  }
  async execute(imageId: number) {
    // ### TODO: remove. you have the image in the caller
    const image = await this.imageRepository.findOne(imageId);
    const imagePath = path.join(inputImagesDir, image.name);

    const detectedObjects = image.detectedObjects
    console.log('### detectedObjects', detectedObjects)

    const originalWidth = image.width;
    const originalHeight = image.height;

    const svgRectangles = this.createRectangles(detectedObjects)

    const svgImage = `
      <svg width="${originalWidth}" height="${originalHeight}">
        ${svgRectangles}
      </svg>
    `;

    const fileName = image.name;
    console.log('### doiiuc outputImagesDir', outputImagesDir)
    const outputFilePath = path.join(outputImagesDir, 'detected_images', fileName); // Create output file path

    // Step 3: Overlay the SVG on the Original Image
    const bufferWithBoundingBoxes = await sharp(imagePath)
      .composite([{ input: Buffer.from(svgImage), top: 0, left: 0 }])
      .toFile(outputFilePath);

    // Step 4: Save or Return the Image
    console.log('### bufferWithBoundingBoxes', bufferWithBoundingBoxes)
  }

  private createRectangles(detectedObjects: DetectedObject[]) {
    // Step 2: Create an SVG Overlay with Bounding Boxes
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