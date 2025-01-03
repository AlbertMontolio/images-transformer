import fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';  // TensorFlow.js for Node.js
import * as mobilenet from '@tensorflow-models/mobilenet';  // MobileNet for image classification
import sharp from 'sharp';

export class RecogniseImageUseCase {
  async execute(imagePath: string) {
    try {
      // Read the image using sharp (resize to 224x224 as required by MobileNet)
      const imageData = new Uint8Array([255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 0, 0]); // RGB values for 2x2 image

      console.log('### imageData', imageData);

      // const imageBuffer = await sharp(Buffer.from(imageData), {
      //   raw: {
      //     width: 2,  // Width of the image
      //     height: 2, // Height of the image
      //     channels: 3 // RGB channels
      //   }
      // })
      //   .png() // Encode as PNG
      //   .toBuffer();

      const imageBuffer = await sharp(imagePath)
        .toBuffer();  // Get the image buffer

      console.log('### imageBuffer', imageBuffer)
      const metadata = await sharp(imageBuffer).metadata();
      console.log('### Image Metadata:', metadata);

      // const rawTensor = tf.tensor3d(imageData, [2, 2, 3], 'int32'); // [width, height, channels]
      // console.log('fuck', rawTensor.toString());

      const imageTensor = tf.node.decodeImage(imageBuffer, 3); // Decode image to 3 channels (RGB)
      console.log({ imageTensor })
      console.log('### fuck')
      const imageTensor3D = imageTensor.squeeze(); // Remove the batch dimension


      const model = await mobilenet.load();
      // @ts-ignore: Ignore the type error for this line
      const predictions = await model.classify(imageTensor3D);
      console.log('Predictions:');
      predictions.forEach((prediction) => {
        console.log(`${prediction.className}: ${prediction.probability}`);
      });


    } catch (err) {
      console.error('Error during classification:', err);
    }
    return true;
  }
}
