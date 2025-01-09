import fs from 'fs-extra';
import path from 'path';
import sharp, { Metadata } from 'sharp';
import ExifReader from 'exifreader';
import { inputImagesDir } from '../../config.js';
import dotenv from 'dotenv';
dotenv.config();

const IMAGE_EXTENSIONS: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.heic', '.webp'];

export class ReadImagesNamesUseCase {
  async execute() {
    const inputPath = inputImagesDir
    const exists: boolean = await this.folderExists(inputPath);

    if (!exists) {
      return null;
    }
    console.log({ exists })
    const files: string[] = await fs.readdir(inputPath);
    console.log({ files })

    files.forEach((file) => {
      const extName = path.extname(file).toLowerCase()
    })

    const imageFiles: string[] = files.filter((file: string) =>
      IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );

    return imageFiles;

    const imagesPaths: string[] = []
    for (const imageFile of imageFiles) {
      const imagePath: string = path.join(inputPath, imageFile);
      imagesPaths.push(imagePath)

      try {
        const fileBuffer = await fs.readFile(imagePath);
        // Open and process each image
        const metadata: Metadata = await sharp(imagePath).metadata();
        if (metadata.exif) {
          const tags = ExifReader.load(fileBuffer)
          const imageDate = tags['DateTimeOriginal'].description;

          // const tags = await ExifReader.load(fileBuffer);
        } else {
        }
      } catch (err) {
        console.error(`Failed to open ${imageFile}: ${err.message}`);
      }
    }

    return imagesPaths;
  }

  async folderExists(folderPath: string): Promise<boolean> {
    try {
      const exists: boolean = await fs.pathExists(folderPath);
      return exists;
    } catch (err) {
      console.error(`Error checking if folder exists: 's{err.message}'`);
      return false;
    }
  }
}
