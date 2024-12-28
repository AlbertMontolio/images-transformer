import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
// Define a type for the list of valid image extensions
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];
// Path to the input images folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputFolder = path.join(__dirname, 'input_images');
// Function to check if the folder exists
const folderExists = async (folderPath) => {
    try {
        const exists = await fs.pathExists(folderPath);
        return exists;
    }
    catch (err) {
        console.error(`Error checking if folder exists: 's{err.message}'`);
        return false;
    }
};
// Function to read and process images from the input folder
export const processImages = async () => {
    console.log('### starting... reading... images');
    try {
        // Check if the folder exists
        const exists = await folderExists(inputFolder);
        if (!exists) {
            console.log(`The folder '${inputFolder}' does not exist.`);
            return;
        }
        // List all image files in the input folder
        const files = await fs.readdir(inputFolder);
        const imageFiles = files.filter((file) => imageExtensions.includes(path.extname(file).toLowerCase()));
        if (imageFiles.length === 0) {
            console.log(`No image files found in the folder '${inputFolder}'.`);
        }
        else {
            console.log(`Found the following image files in '${inputFolder}':`);
            for (const imageFile of imageFiles) {
                const imagePath = path.join(inputFolder, imageFile);
                try {
                    // Open and process each image
                    const metadata = await sharp(imagePath).metadata();
                    console.log(`Successfully opened: ${imageFile}, Size: ${metadata.width}x${metadata.height}, Format: ${metadata.format}`);
                }
                catch (err) {
                    console.error(`Failed to open ${imageFile}: s{err.message}`);
                }
            }
        }
    }
    catch (err) {
        console.error(`Error processing images: s{err.message}`);
    }
};
// Run the image processing
//# sourceMappingURL=read-images.js.map