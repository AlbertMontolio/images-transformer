import express from 'express';

import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'

import { createBullBoard } from '@bull-board/api'
import { imageCategorizationQueue } from './image/infraestructure/queues/image-categorization.queue.js';
import { imageTransformationQueue } from './image/infraestructure/queues/image-transformation.queue.js';
import { GetImagesInDbUseCase } from './image/application/use-cases/get-images-in-db.use-case.js';
import { ProcessImagesUseCase } from './image/application/use-cases/process-images.use-case.js';
import { GetTransformedImagesInDbUseCase } from './image/application/use-cases/get-transformed-images-in-db.use-case.js';

// Initialize BullMQ queue

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [new BullMQAdapter(imageCategorizationQueue), new BullMQAdapter(imageTransformationQueue)],
    serverAdapter: serverAdapter,
});

const app = express();
app.use(express.json());

app.use('/admin/queues', serverAdapter.getRouter());

app.get('/run', async (req, res) => {
    // Logic for receiving source/target paths
    const inputImagesDir = '/Users/albertmontolio/Documents/coding_area/interviews/koerber/input_images'
    const outputImagesDir = '/Users/albertmontolio/Documents/coding_area/interviews/koerber/output_images'

    

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
