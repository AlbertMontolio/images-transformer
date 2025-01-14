import path from "path";
import { Sharp } from "sharp";

export class WriteImageService {
  constructor(private readonly outputImagesDir: string) {}
  
  async execute(image: Sharp, filename: string): Promise<void> {
    await image.toFile(path.join(this.outputImagesDir, 'transformed_images', filename));
  }

  async executeMany(images: { image: Sharp; filename: string }[]): Promise<void> {
    await Promise.all(
      images.map(({ image, filename }) => 
        this.execute(image, filename)
      )
    );
  }
}