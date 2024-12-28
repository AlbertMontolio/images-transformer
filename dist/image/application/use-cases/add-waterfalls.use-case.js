import sharp from 'sharp';
import path from 'path';
export class AddWaterfallsUseCase {
    watermarkText;
    outputImagesDir;
    constructor(watermarkText, outputImagesDir) {
        this.watermarkText = watermarkText;
        this.outputImagesDir = outputImagesDir;
    }
    async execute(inputImagesPaths) {
        try {
            const results = await Promise.all(inputImagesPaths.map((path) => this.addWaterfall(path)));
            return results; // Return an array of Buffers with watermarked images
        }
        catch (err) {
            console.error('Error processing images:', err);
            throw err;
        }
    }
    async addWaterfall(inputImagePath) {
        console.log('### -------');
        console.log('### inputImagePath', inputImagePath);
        const fileName = path.basename(inputImagePath);
        const outputFilePath = path.join(this.outputImagesDir, fileName); // Create output file path
        try {
            // Resize the image to 1000px width, and get its new dimensions after resize
            const image = sharp(inputImagePath);
            const { width, height } = await image.metadata();
            const targetWidth = 1000;
            const divider = width / targetWidth;
            const resizedWidth = width / divider;
            const resizedHeight = height / divider;
            // Apply watermark with resized dimensions
            await image
                .resize(targetWidth) // Ensure it stays resized
                .withMetadata()
                .composite([
                {
                    input: Buffer.from(`
              <svg width="${resizedWidth}" height="${resizedHeight}">
                <text x="0" y="40" font-size="60" fill="white" opacity="0.5">
                  ${this.watermarkText}
                </text>
              </svg>`),
                    gravity: 'center', // Position the watermark at the center
                },
            ])
                .toFile(outputFilePath); // Write the output image with watermark
            console.log('Watermark added successfully!');
        }
        catch (err) {
            console.error('Error applying watermark:', err);
        }
    }
}
//# sourceMappingURL=add-waterfalls.use-case.js.map