import dotenv from 'dotenv';
dotenv.config();

// const isDocker = process.env.CONTAINER_INPUT_FOLDER

export const hostInputImagesDir = process.env.HOST_INPUT_FOLDER
const dockerInputImagesDir = process.env.CONTAINER_INPUT_FOLDER
export const inputImagesDir = dockerInputImagesDir || hostInputImagesDir
console.log('### config.ts: inputImagesDir', inputImagesDir)

export const hostOutputImagesDir = process.env.HOST_OUTPUT_FOLDER
const dockerOutputImagesDir = process.env.CONTAINER_OUTPUT_FOLDER
export const outputImagesDir = dockerOutputImagesDir || hostOutputImagesDir
console.log('### config.ts: outputImagesDir', outputImagesDir)
