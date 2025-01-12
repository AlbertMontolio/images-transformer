import * as tf from '@tensorflow/tfjs-node'; // TensorFlow.js for Node.js
import * as mobilenet from '@tensorflow-models/mobilenet'; // MobileNet for image classification
import sharp from 'sharp';
import { Prediction } from '../types/prediction';
import { Image } from '@prisma/client';
import { inputImagesDir } from '../../config';
import path from 'path';

export class CategorizeImageService {
  async execute(image: Image): Promise<Prediction[]> {
    const { name } = image;
    let imageTensor3D: tf.Tensor3D | undefined;

    try {
      // Read and process the image using Sharp
      const inputImagePath = path.join(inputImagesDir, name);
      console.log('### cis inputImagePath', inputImagePath);
      const imageBuffer = await sharp(inputImagePath).toBuffer();

      // Decode image to a tensor
      const imageTensor = tf.node.decodeImage(imageBuffer, 3);
      imageTensor3D = imageTensor as tf.Tensor3D;

      // Load the MobileNet model
      // TODO: do not load it by every image iteration...
      const model = await mobilenet.load();

      // Perform classification
      const predictions: Prediction[] = await model.classify(imageTensor3D);

      return predictions;
    } catch (err) {
      console.error('Error during classification:', err);
      throw new Error('Image classification failed.');
    } finally {
      // Dispose of the tensor to free memory
      if (imageTensor3D) {
        imageTensor3D.dispose();
      }
    }
  }
}
