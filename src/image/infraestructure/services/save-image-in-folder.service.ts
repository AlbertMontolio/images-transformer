import path from "path";
import { Sharp } from "sharp";

export class SaveImageInFolderService {
  constructor(private readonly outputImagesDir: string) {}
  
  async execute(image: Sharp, name: string): Promise<void> {
    const storeOutputFilePath = path.join(this.outputImagesDir, 'transformed_images', name);

    await image.withMetadata().toFile(storeOutputFilePath);
  }
}