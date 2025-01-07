import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import sharp from 'sharp';
import { Image } from '@prisma/client';

export interface DetectedObject {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export class DetectObjectsService {
  async execute(image: Image): Promise<DetectedObject[]> {
    const imagePath = image.path;
    const metadata = await sharp(imagePath).metadata();
    const originalWidth = metadata.width!;
    const originalHeight = metadata.height!;
    console.log('### Original Dimensions:', originalWidth, originalHeight);
    // Step 1: Load and Resize the Image
    const resizedImageBuffer = await sharp(imagePath)
        .resize(640, 640) // Resize image to 640x640 (Coco SSD works with flexible sizes)
        .toFormat('jpeg')
        .toBuffer();
    console.log('### resizedImageBuffer', resizedImageBuffer)

    // Step 2: Decode the Image into a Tensor
    let imageTensor = tf.node.decodeImage(resizedImageBuffer, 3); // Decode to RGB tensor
    console.log('### imageTensor', imageTensor)

    // Step 3: Remove Extra Dimensions
    // If the tensor has a batch dimension of size 1, remove it
    while (imageTensor.shape.length > 3) {
      imageTensor = imageTensor.squeeze();
      console.log('Squeezed imageTensor shape:', imageTensor.shape);
    }

    // Step 4: Convert Tensor to `int32`
    const inputTensor = imageTensor.toInt(); // Add batch dimension [1, height, width, 3]
    console.log('Final inputTensor shape:', inputTensor.shape);
    console.log('Final inputTensor dtype:', inputTensor.dtype);

    // Ensure the tensor is now of shape [height, width, 3]
    if (imageTensor.shape.length !== 3) {
      throw new Error(`Unexpected tensor shape after squeezing: ${imageTensor.shape}`);
    }

    console.log('### albert 1')
    // Load the Coco SSD model
    const model = await cocoSsd.load();
    console.log('### model', model)
    // Perform object detection
    try {
    // @ts-ignore: Ignore the type error for this line
      const predictions = await model.detect(inputTensor);
      console.log('### Detected Objects:', predictions);
      imageTensor.dispose();
      inputTensor.dispose();

      return predictions
    } catch (err) {
      console.log('### coco err: ', err)
    }
  }
}