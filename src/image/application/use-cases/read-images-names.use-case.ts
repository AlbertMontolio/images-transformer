import fs from 'fs-extra';
import path from 'path';
import { inputImagesDir } from '../../config';
import dotenv from 'dotenv';
import { injectable } from 'tsyringe';

dotenv.config();

const IMAGE_EXTENSIONS: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.heic', '.webp'];

@injectable()
export class ReadImagesNamesUseCase {
  async execute() {
    const inputPath = inputImagesDir
    const exists: boolean = await this.folderExists(inputPath);

    if (!exists) {
      return null;
    }
    const files: string[] = await fs.readdir(inputPath);

    const imageFiles: string[] = files.filter((file: string) =>
      IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );

    return imageFiles;
  }

  async folderExists(folderPath: string): Promise<boolean> {
    try {
      const exists: boolean = await fs.pathExists(folderPath);
      return exists;
    } catch (err) {
      console.error(`Error checking if folder exists: ${err.message}`);
      return false;
    }
  }
}
