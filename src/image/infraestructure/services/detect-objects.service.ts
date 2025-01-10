import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import sharp from 'sharp';
import { Image } from '@prisma/client';
import path from 'path';
import { inputImagesDir } from '../../config';

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export class DetectObjectsService {
  async execute(image: Image): Promise<DetectedObject[]> {
    const imagePath = path.join(inputImagesDir, image.name);

    let imageTensor: tf.Tensor3D | undefined;
    let inputTensor: tf.Tensor3D | undefined;

    try {
      // Step 1: Load and Resize the Image
      const resizedImageBuffer = await sharp(imagePath)
        .resize(640, 640) // Resize image to 640x640 (Coco SSD works with flexible sizes)
        .toFormat('jpeg')
        .toBuffer();

      // Step 2: Decode the Image into a Tensor
      imageTensor = tf.node.decodeImage(resizedImageBuffer, 3) as tf.Tensor3D;

      // Step 3: Ensure the Tensor Shape is Correct
      if (imageTensor.shape.length !== 3) {
        throw new Error(`Unexpected tensor shape: ${imageTensor.shape}`);
      }

      // Step 4: Convert Tensor to `int32`
      inputTensor = imageTensor.toInt();

      // Load the Coco SSD model
      const model = await cocoSsd.load();

      // Perform object detection
      const predictions = await model.detect(inputTensor);

      return predictions.map((prediction) => ({
        class: prediction.class,
        score: prediction.score,
        bbox: prediction.bbox as [number, number, number, number],
      }));
    } catch (err) {
      console.error('Error during object detection:', err);
      throw new Error('Object detection failed.');
    } finally {
      // Dispose of tensors to free memory
      if (imageTensor) imageTensor.dispose();
      if (inputTensor) inputTensor.dispose();
    }
  }
}
