import fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';  // TensorFlow.js for Node.js
import * as mobilenet from '@tensorflow-models/mobilenet';  // MobileNet for image classification
import sharp from 'sharp';
import { Queue } from 'bullmq';
import { imageQueue } from '../../infraestructure/queues/image-transformation.queue.js';

export class RecogniseImageUseCase {
  constructor(
    private readonly outputImagesDir: string,
  ) {}

  async execute(imagePath: string) {
    try {
      console.log('### queue', imageQueue);
      console.log('### 123 imagePath', imagePath);

      const jobData = {
        imagePath,
        outputImagesDir: this.outputImagesDir,
      };

      console.log('### adding jobData to queue')
      await imageQueue.add('process-image', jobData);
    } catch (err) {
      console.error('Error during classification:', err);
    }
    return true;
  }
}
