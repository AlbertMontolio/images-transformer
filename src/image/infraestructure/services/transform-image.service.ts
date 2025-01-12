import sharp, { Sharp } from 'sharp';
import path from 'path';
import { TransformedImageRepository } from '../repositories/transformed-image.repository';
import { hostOutputImagesDir, outputImagesDir } from '../../config';
import { FilterSelectorService } from '../../domain/services/filter-selector.service';

type FilterOption = {
  name: string;
  applyFilter: (sharp: Sharp) => void;
  value?: unknown;
};

export class TransformImageService {
  transformedImageRepository: TransformedImageRepository;
  filterSelectorService: FilterSelectorService;

  constructor() {
    this.transformedImageRepository = new TransformedImageRepository();
    this.filterSelectorService = new FilterSelectorService();
  }

  async execute({
    imagePath,
    imageName,
    watermarkText,
    imageId,
  }: {
    imagePath: string;
    imageName: string;
    watermarkText: string;
    imageId: number;
  }): Promise<void> {
    const repositoryOutputFilePath = path.join(hostOutputImagesDir, 'transformed_images', imageName);

    try {
      const transformedImage = await this.transformedImageRepository.create({
        path: repositoryOutputFilePath,
        imageId,
      });

      if (!transformedImage) {
        console.error('Failed to create transformed image record');
        return;
      }

      const sharpImage = sharp(imagePath);
      const metadata = await sharpImage.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Unable to retrieve image dimensions');
      }

      const targetWidth = 1000;
      const divider = metadata.width / targetWidth;
      const resizedWidth = metadata.width / divider;
      const resizedHeight = metadata.height / divider;

      sharpImage.resize(targetWidth);

      const filter = this.filterSelectorService.getRandomFilter();
      console.log('### filter', filter);
      filter.applyFilter(sharpImage);

      await this.transformedImageRepository.update({
        input: {
          filterType: filter.name,
          filterValue: filter.value?.toString(),
        },
        transformedId: transformedImage.id,
      });

      this.applyWatermark({
        sharpImage,
        watermarkText,
        resizedWidth,
        resizedHeight,
      });

      await this.transformedImageRepository.update({
        input: {
          width: resizedWidth,
          height: resizedHeight,
          watermarkText,
        },
        transformedId: transformedImage.id,
      });

      const storeOutputFilePath = path.join(outputImagesDir, 'transformed_images', imageName);

      await sharpImage.withMetadata().toFile(storeOutputFilePath);
    } catch (err) {
      console.error('Error during image transformation:', err);
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
            <text x="20" y="60" font-size="60" fill="white" opacity="0.5">
              ${watermarkText}
            </text>
          </svg>
        `),
        gravity: 'center',
      },
    ]);
  }
}
