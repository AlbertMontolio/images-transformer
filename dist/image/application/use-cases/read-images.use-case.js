import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import ExifReader from 'exifreader';
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.heic', '.webp'];
export class ReadImagesUseCase {
    inputPath;
    constructor(inputPath) {
        this.inputPath = inputPath;
    }
    async execute() {
        const exists = await this.folderExists(this.inputPath);
        if (!exists) {
            return null;
        }
        console.log({ exists });
        const files = await fs.readdir(this.inputPath);
        console.log({ files });
        files.forEach((file) => {
            console.log('### file', file);
            const extName = path.extname(file).toLowerCase();
            console.log('### extName', extName);
        });
        console.log('### files a', files);
        const imageFiles = files.filter((file) => IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()));
        console.log('### imageFiles b', imageFiles);
        const imagesPaths = [];
        for (const imageFile of imageFiles) {
            const imagePath = path.join(this.inputPath, imageFile);
            imagesPaths.push(imagePath);
            try {
                const fileBuffer = await fs.readFile(imagePath);
                // Open and process each image
                const metadata = await sharp(imagePath).metadata();
                console.log(`Successfully opened: ${imageFile}, Size: ${metadata.width}x${metadata.height}, Format: ${metadata.format}`);
                if (metadata.exif) {
                    const tags = ExifReader.load(fileBuffer);
                    const imageDate = tags['DateTimeOriginal'].description;
                    console.log('### imageDate', imageDate);
                    // const tags = await ExifReader.load(fileBuffer);
                    console.log('### hello world', metadata.exif);
                }
                else {
                    console.log("No EXIF data found in the image.");
                }
            }
            catch (err) {
                console.error(`Failed to open ${imageFile}: ${err.message}`);
            }
        }
        return imagesPaths;
    }
    async folderExists(folderPath) {
        try {
            const exists = await fs.pathExists(folderPath);
            return exists;
        }
        catch (err) {
            console.error(`Error checking if folder exists: 's{err.message}'`);
            return false;
        }
    }
}
//# sourceMappingURL=read-images.use-case.js.map