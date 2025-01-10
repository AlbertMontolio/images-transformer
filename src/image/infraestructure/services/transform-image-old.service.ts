import sharp, { Sharp } from 'sharp';
import path from 'path';
import { TransformedImageRepository } from '../repositories/transformed-image.repository';
import { hostOutputImagesDir, outputImagesDir } from '../../config';

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
    imageName,
    watermarkText,
    imageId,
  }: {
    imagePath: string; // ### TODO: remove
    imageName: string;
    watermarkText: string;
    imageId: number;
  }) {
    const repositoryOutputFilePath = path.join(hostOutputImagesDir, 'transformed_images', imageName); // Create output file path

    const transformedImage = await this.transformedImageRepository.create({
      path: repositoryOutputFilePath,
      imageId,
    })

    if (!transformedImage) {
      return;
    }

    const transformedId = transformedImage.id;

    try {
      const sharpImage = sharp(imagePath);
      const { width, height } = await sharpImage.metadata();

      const targetWidth = 1000
      const divider = width / targetWidth
      const resizedWidth = width / divider
      const resizedHeight = height / divider

      const appliedFilter = this.applyRandomFilter(sharpImage)
      await this.transformedImageRepository.update({
        input: {
          filterType: appliedFilter.name,
          filterValue: appliedFilter.value?.toString()
        },
        transformedId,
      })

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

      const storeOutputFilePath = path.join(outputImagesDir, 'transformed_images', imageName); // Create output file path

      await sharpImage
        .withMetadata()
        .toFile(storeOutputFilePath);
  
    } catch (err) {
      console.error('Error applying transformations:', err);
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
