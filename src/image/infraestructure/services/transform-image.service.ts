import sharp, { Sharp } from 'sharp';
import path from 'path';
import { TransformedImageRepository } from '../repositories/transformed-image.repository.js';

type FilterOption = {
  name: string;
  applyFilter: (sharp: Sharp) => void;
  value?: unknown;
}

export class TransformImageService {
  transformedImageRepository: TransformedImageRepository;

  constructor() {
    this.transformedImageRepository = new TransformedImageRepository()
  }

  async execute({
    imagePath,
    watermarkText,
    outputImagesDir,
    imageId,
  }: {
    imagePath: string;
    watermarkText: string;
    outputImagesDir: string;
    imageId: number;
  }) {
    console.log('### -------')
    console.log('### 123 inputImagePath', imagePath)
    const fileName = path.basename(imagePath);
    const outputFilePath = path.join(outputImagesDir, fileName); // Create output file path
    console.log('### 1 imageId', imageId)

    console.log('### transformedImageRepository', this.transformedImageRepository)

    const transformedImage = await this.transformedImageRepository.create({
      path: outputFilePath,
      imageId,
    })

    if (!transformedImage) {
      return;
    }

    const transformedId = transformedImage.id;

    try {
      // Resize the image to 1000px width, and get its new dimensions after resize
      const sharpImage = sharp(imagePath);
      const { width, height } = await sharpImage.metadata();

      const targetWidth = 1000
      const divider = width / targetWidth
      const resizedWidth = width / divider
      const resizedHeight = height / divider

      const appliedFilter = this.applyRandomFilter(sharpImage)
      console.log('### albert 4')
      await this.transformedImageRepository.update({
        input: {
          filterType: appliedFilter.name,
          filterValue: appliedFilter.value?.toString()
        },
        transformedId,
      })

      console.log('### resizing image')
      sharpImage.resize(targetWidth)
      const inputUpdate = {
        width: resizedWidth,
        height: resizedHeight
      }
      await this.transformedImageRepository.update({
        input: inputUpdate,
        transformedId,
      })

      this.applyWatermark({
        sharpImage,
        watermarkText,
        resizedWidth,
        resizedHeight,
      })
      await this.transformedImageRepository.update({
        input: { watermarkText },
        transformedId,
      })

      await sharpImage
        .withMetadata()
        .toFile(outputFilePath);
  
      console.log('Watermark added successfully!');
    } catch (err) {
      console.error('Error applying watermark:', err);
    }
  }

  private applyWatermark({
    sharpImage,
    watermarkText,
    resizedWidth,
    resizedHeight,
  }: {
    sharpImage: Sharp;
    watermarkText: string;
    resizedWidth: number;
    resizedHeight: number;
  }): void {
    sharpImage.composite([
      {
        input: Buffer.from(`
          <svg width="${resizedWidth}" height="${resizedHeight}">
            <text x="0" y="40" font-size="60" fill="white" opacity="0.5">
              ${watermarkText}
            </text>
          </svg>`),
        gravity: 'center'
      },
    ])
  }

  private applyRandomFilter(image: Sharp): FilterOption {
    const greyScale = (): FilterOption => ({
      name: 'greyscale',
      applyFilter: (img: Sharp) => img.greyscale()
    })

    const blur = (): FilterOption => {
      const value = Math.random() * 5;

      return {
        name: 'blur',
        applyFilter: (img: Sharp) => img.blur(value),
        value,
      }
    }

    const sharpen = (): FilterOption => {
      const value = { sigma: Math.random() * 2 + 1 } 

      return {
        name: 'sharpen',
        applyFilter: (img: Sharp) => img.sharpen({ sigma: Math.random() * 2 + 1 }),
        value,
      }
    }

    const tint = (): FilterOption => {
      const value = { r: this.randomInt(0, 255), g: this.randomInt(0, 255), b: this.randomInt(0, 255) };

      return {
        name: 'tint',
        applyFilter: (img: Sharp) => img.tint(value),
        value,
      }
    }

    const filterOptions = [ greyScale, blur, sharpen, tint ];
  
    const randomNumber = Math.floor(Math.random() * filterOptions.length);
    const randomFilter = filterOptions[randomNumber];
    const { applyFilter, name, value } = randomFilter();

    applyFilter(image);

    return randomFilter(); 
  }

  private randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}