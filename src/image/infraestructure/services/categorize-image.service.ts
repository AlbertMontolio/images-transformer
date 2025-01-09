import * as tf from '@tensorflow/tfjs-node';  // TensorFlow.js for Node.js
import * as mobilenet from '@tensorflow-models/mobilenet';  // MobileNet for image classification
import sharp from 'sharp';
import { Prediction } from '../types/prediction.js';
import fs from 'fs';

export class CategorizeImageService {
  // constructor(private readonly queue: Queue) {}

  async execute(imagePath: string): Promise<Prediction[]> {
    // Read the image using sharp (resize to 224x224 as required by MobileNet)
    console.log('### Processing file at path:', imagePath);
    if (!fs.existsSync(imagePath)) {
      console.error('### cis File does not exist:', imagePath);
      throw new Error(`### cis File not found: ${imagePath}`);
    }

    let imageBuffer = null;
    try {
      imageBuffer = await sharp(imagePath).toBuffer();  // Get the image buffer
    } catch (err) {
      console.log('### fucking imageBuffer err', err)
    }
    try {

      console.log('### imageBuffer', imageBuffer)
      const metadata = await sharp(imageBuffer).metadata();
      console.log('### Image Metadata:', metadata);

      const imageTensor = tf.node.decodeImage(imageBuffer, 3); // Decode image to 3 channels (RGB)
      console.log({ imageTensor })
      const imageTensor3D = imageTensor.squeeze(); // Remove the batch dimension

      const model = await mobilenet.load();
      // @ts-ignore: Ignore the type error for this line
      const predictions: Prediction[] = await model.classify(imageTensor3D);
      console.log('### Predictions:');
      predictions.forEach((prediction) => {
        console.log(`### ${prediction.className}: ${prediction.probability}`);
      });

      return predictions;
    } catch (err) {
      console.error('Error during classification:', err);
      return [];
    }
  }
}
