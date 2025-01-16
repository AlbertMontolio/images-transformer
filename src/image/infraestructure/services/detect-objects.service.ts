import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import sharp from 'sharp';
import path from 'path';
import { inputImagesDir } from '../../config';
import { Image } from '@prisma/client';
import { DetectionError } from '../../domain/errors/detection.error';

export interface DetectedObjectPrediction {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export class DetectObjectsService {
  constructor(private readonly model: cocoSsd.ObjectDetection) {}

  private async resizeImage(inputImagePath: string): Promise<[Buffer, number, number]> {
    try {
      // Get original image dimensions
      const metadata = await sharp(inputImagePath).metadata();
      const originalWidth = metadata.width || 640;
      const originalHeight = metadata.height || 640;

      const resizedBuffer = await sharp(inputImagePath)
        .resize(640, 640)
        .toFormat('jpeg')
        .toBuffer();

      return [resizedBuffer, originalWidth, originalHeight];
    } catch (err) {
      throw new DetectionError('Failed to resize image: dimensions mismatch', err);
    }
  }

  private resizeBox(
    bbox: [number, number, number, number],
    originalWidth: number,
    originalHeight: number
  ): [number, number, number, number] {
    const [x, y, width, height] = bbox;
    
    // Calculate scaling ratios
    const widthRatio = originalWidth / 640;
    const heightRatio = originalHeight / 640;

    // Scale back the coordinates and dimensions
    return [
      x * widthRatio,
      y * heightRatio,
      width * widthRatio,
      height * heightRatio
    ];
  }

  async execute(image: Image): Promise<DetectedObjectPrediction[]> {
    const { name } = image;
    const inputImagePath = path.join(inputImagesDir, name);

    let imageTensor: tf.Tensor3D | undefined;
    let inputTensor: tf.Tensor3D | undefined;

    try {
      // Step 1: Load and Resize the Image
      const [resizedImageBuffer, originalWidth, originalHeight] = await this.resizeImage(inputImagePath);

      // Step 2: Decode the Image into a Tensor
      imageTensor = tf.node.decodeImage(resizedImageBuffer, 3) as tf.Tensor3D;

      // Step 3: Validate tensor shape
      if (imageTensor.shape.length !== 3) {
        throw new DetectionError(`Invalid tensor shape: ${imageTensor.shape}`);
      }

      // Step 4: Convert Tensor to `int32`
      inputTensor = imageTensor.toInt();

      // Step 5: Perform object detection
      const predictions = await this.model.detect(inputTensor);

      // transform predictions to real size
      return predictions.map((prediction) => {
        const resizedBox = this.resizeBox(prediction.bbox, originalWidth, originalHeight);
        return {
          class: prediction.class,
          score: prediction.score,
          bbox: resizedBox,
        }
      });
    } catch (err) {
      console.log('Caught in execute:', err);
      console.log('Error type:', err.constructor.name);
      console.log('Is DetectionError:', err instanceof DetectionError);
      
      if (err instanceof DetectionError) {
        throw err;
      }
      throw new DetectionError('Object detection failed', err);
    } finally {
      // Dispose of tensors to free memory
      if (imageTensor) {
        try {
          imageTensor.dispose();
        } catch (err) {
          console.warn('Failed to dispose imageTensor:', err);
        }
      }
      if (inputTensor) {
        try {
          inputTensor.dispose();
        } catch (err) {
          console.warn('Failed to dispose inputTensor:', err);
        }
      }
    }
  }
}
