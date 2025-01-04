import * as tf from '@tensorflow/tfjs-node'; // TensorFlow.js for Node.js
import * as mobilenet from '@tensorflow-models/mobilenet'; // MobileNet for image classification
import sharp from 'sharp';
import { LogRepository } from '../repositories/log.repository.js';
export class RecogniseImageService {
    // constructor(private readonly queue: Queue) {}
    async execute({ imageId, imagePath, }) {
        try {
            const logRepository = new LogRepository();
            await logRepository.createLog({
                imageId,
                status: 'recognition-started',
            });
            // Read the image using sharp (resize to 224x224 as required by MobileNet)
            const imageBuffer = await sharp(imagePath)
                .toBuffer(); // Get the image buffer
            console.log('### imageBuffer', imageBuffer);
            const metadata = await sharp(imageBuffer).metadata();
            console.log('### Image Metadata:', metadata);
            const imageTensor = tf.node.decodeImage(imageBuffer, 3); // Decode image to 3 channels (RGB)
            console.log({ imageTensor });
            console.log('### fuck');
            const imageTensor3D = imageTensor.squeeze(); // Remove the batch dimension
            const model = await mobilenet.load();
            // @ts-ignore: Ignore the type error for this line
            const predictions = await model.classify(imageTensor3D);
            console.log('Predictions:');
            predictions.forEach((prediction) => {
                console.log(`${prediction.className}: ${prediction.probability}`);
            });
            console.log('### recognistion-finished');
            await logRepository.createLog({
                imageId,
                status: 'recognition-finished',
            });
        }
        catch (err) {
            console.error('Error during classification:', err);
        }
        return true;
    }
}
//# sourceMappingURL=recognise-image.service.js.map