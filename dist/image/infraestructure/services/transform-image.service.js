import sharp from 'sharp';
import path from 'path';
import { TransformedImageRepository } from '../repositories/transformed-image.repository.js';
export class TransformImageService {
    transformedImageRepository;
    constructor() {
        this.transformedImageRepository = new TransformedImageRepository();
    }
    async execute({ imagePath, watermarkText, outputImagesDir, imageId, }) {
        console.log('### -------');
        console.log('### 123 inputImagePath', imagePath);
        const fileName = path.basename(imagePath);
        const outputFilePath = path.join(outputImagesDir, fileName); // Create output file path
        console.log('### 1 imageId', imageId);
        console.log('### transformedImageRepository', this.transformedImageRepository);
        const transformedImage = await this.transformedImageRepository.create({
            path: outputFilePath,
            imageId,
        });
        if (!transformedImage) {
            return;
        }
        const transformedId = transformedImage.id;
        try {
            // Resize the image to 1000px width, and get its new dimensions after resize
            const sharpImage = sharp(imagePath);
            const { width, height } = await sharpImage.metadata();
            const targetWidth = 1000;
            const divider = width / targetWidth;
            const resizedWidth = width / divider;
            const resizedHeight = height / divider;
            const appliedFilter = this.applyRandomFilter(sharpImage);
            console.log('### albert 4');
            await this.transformedImageRepository.update({
                input: {
                    filterType: appliedFilter.name,
                    filterValue: appliedFilter.value?.toString()
                },
                transformedId,
            });
            console.log('### resizing image');
            sharpImage.resize(targetWidth);
            const inputUpdate = {
                width: resizedWidth,
                height: resizedHeight
            };
            await this.transformedImageRepository.update({
                input: inputUpdate,
                transformedId,
            });
            this.applyWatermark({
                sharpImage,
                watermarkText,
                resizedWidth,
                resizedHeight,
            });
            await this.transformedImageRepository.update({
                input: { watermarkText },
                transformedId,
            });
            await sharpImage
                .withMetadata()
                .toFile(outputFilePath);
            console.log('Watermark added successfully!');
        }
        catch (err) {
            console.error('Error applying watermark:', err);
        }
    }
    applyWatermark({ sharpImage, watermarkText, resizedWidth, resizedHeight, }) {
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
        ]);
    }
    applyRandomFilter(image) {
        const greyScale = () => ({
            name: 'greyscale',
            applyFilter: (img) => img.greyscale()
        });
        const blur = () => {
            const value = Math.random() * 5;
            return {
                name: 'blur',
                applyFilter: (img) => img.blur(value),
                value,
            };
        };
        const sharpen = () => {
            const value = { sigma: Math.random() * 2 + 1 };
            return {
                name: 'sharpen',
                applyFilter: (img) => img.sharpen({ sigma: Math.random() * 2 + 1 }),
                value,
            };
        };
        const tint = () => {
            const value = { r: this.randomInt(0, 255), g: this.randomInt(0, 255), b: this.randomInt(0, 255) };
            return {
                name: 'tint',
                applyFilter: (img) => img.tint(value),
                value,
            };
        };
        const filterOptions = [greyScale, blur, sharpen, tint];
        const randomNumber = Math.floor(Math.random() * filterOptions.length);
        const randomFilter = filterOptions[randomNumber];
        const { applyFilter, name, value } = randomFilter();
        applyFilter(image);
        return randomFilter();
    }
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
//# sourceMappingURL=transform-image.service.js.map