import express from 'express';
import cors from 'cors'

import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'

import { createBullBoard } from '@bull-board/api'
import { imageCategorizationQueue } from './image/infraestructure/queues/image-categorization.queue.js';
import { imageTransformationQueue } from './image/infraestructure/queues/image-transformation.queue.js';
import { GetImagesInDbUseCase } from './image/application/use-cases/get-images-in-db.use-case.js';
import { ProcessImagesUseCase } from './image/application/use-cases/process-images.use-case.js';
import { GetTransformedImagesInDbUseCase } from './image/application/use-cases/get-transformed-images-in-db.use-case.js';
import { ImageRepository } from './image/infraestructure/repositories/image.repository.js';
import { DrawObjectsIntoImage } from './image/application/use-cases/draw-objects-into-image.js';

// Initialize BullMQ queue

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [new BullMQAdapter(imageCategorizationQueue), new BullMQAdapter(imageTransformationQueue)],
    serverAdapter: serverAdapter,
});

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001', // Allow only this origin
  }));
app.use(cors());

app.use('/admin/queues', serverAdapter.getRouter());

app.get('/run', async (req, res) => {
    // Logic for receiving source/target paths
    // const inputImagesDir = '/Users/albertmontolio/Documents/coding_area/interviews/koerber/input_images'
    // const outputImagesDir = '/Users/albertmontolio/Documents/coding_area/interviews/koerber/output_images'

    const inputImagesDir = '/usr/src/app/input_images'; // Mounted from the host
    const outputImagesDir = '/usr/src/app/transformed_images'; // Mounted from the host

    const processImagesUseCase = new ProcessImagesUseCase(
        inputImagesDir,
        outputImagesDir,
    )

    await processImagesUseCase.execute();

    // const heicToJpegConverterService = new HeicToJpegConverterService()
    // await heicToJpegConverterService.execute(inputImagesDir)

    // const transformImagesUseCase = new TransformImagesUseCase(
    //     imagesPaths,
    //     outputImagesDir,
    // )

    // transformImagesUseCase.execute('koerber');
    res.send('test');
});

app.post('/transform', (req, res) => {
    // Logic for applying transformations
    res.send('Transform endpoint');
});

app.get('/status', (req, res) => {
    // Logic for retrieving processing status
    res.send('Status endpoint');
});

app.get('/images', async (req, res) => {
    const getImagesInDbUseCase = new GetImagesInDbUseCase()

    const images = await getImagesInDbUseCase.execute()
    res.send(images);
});

app.get('/transformed-images', async (req, res) => {
    const getTransformedImagesInDbUseCase = new GetTransformedImagesInDbUseCase()

    const transformedImages = await getTransformedImagesInDbUseCase.execute()
    res.send(transformedImages);
});

app.get('/images/:id', async (req, res) => {
    const imageId = req.params.id;
    const imageRepository = new ImageRepository()

    const image = await imageRepository.findOne(+imageId)
    res.send(image);
});

app.get('/detected-image', async (req, res) => {
    const drawObjectsIntoImage = new DrawObjectsIntoImage()
    const image = drawObjectsIntoImage.execute(2)
    res.send(image);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
