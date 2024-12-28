import fs from 'fs';
import path from 'path';
import heicConvert from 'heic-convert';
import mkdirp from 'mkdirp'; // To ensure 'heics' folder exists
import { promisify } from 'util';
const rename = promisify(fs.rename); // To rename (move) files asynchronously
export class HeicToJpegConverterService {
    async execute(folderPath) {
        try {
            // Ensure the 'heics' folder exists or create it
            const heicsFolderPath = path.join(folderPath, 'heics');
            await mkdirp(heicsFolderPath);
            // Read all files in the folder
            const files = fs.readdirSync(folderPath);
            // Process each file in the folder
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const fileExt = path.extname(file).toLowerCase();
                if (fileExt === '.heic') {
                    // If it's a HEIC file, convert to JPEG
                    await this.convertHeicToJpeg(filePath, folderPath);
                    // Move the HEIC file to the 'heics' folder
                    const heicTargetPath = path.join(heicsFolderPath, file);
                    await rename(filePath, heicTargetPath);
                }
            }
            console.log('HEIC conversion complete, and HEIC files moved!');
        }
        catch (err) {
            console.error('Error during HEIC conversion and file move:', err);
        }
    }
    async convertHeicToJpeg(inputPath, outputFolder) {
        try {
            const inputBuffer = fs.readFileSync(inputPath);
            const outputBuffer = await heicConvert({
                buffer: inputBuffer, // input HEIC file buffer
                format: 'JPEG', // output format
                quality: 1 // quality level (1 is highest quality)
            });
            // Write the output JPEG buffer to the same folder
            const outputPath = path.join(outputFolder, `${path.basename(inputPath, '.heic')}.jpeg`);
            fs.writeFileSync(outputPath, outputBuffer);
            console.log(`Converted ${inputPath} to ${outputPath}`);
        }
        catch (err) {
            console.error(`Error converting HEIC file ${inputPath}:`, err);
        }
    }
}
//# sourceMappingURL=heic-to-jpeg-converter.service.js.map