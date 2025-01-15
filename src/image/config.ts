import dotenv from 'dotenv';
dotenv.config();

export const hostInputImagesDir = process.env.HOST_INPUT_FOLDER
const dockerInputImagesDir = process.env.CONTAINER_INPUT_FOLDER
export const inputImagesDir = dockerInputImagesDir || hostInputImagesDir

export const hostOutputImagesDir = process.env.HOST_OUTPUT_FOLDER
const dockerOutputImagesDir = process.env.CONTAINER_OUTPUT_FOLDER
export const outputImagesDir = dockerOutputImagesDir || hostOutputImagesDir

export const redisHost = process.env.REDIS_HOST || 'localhost'
