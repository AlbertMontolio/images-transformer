import express from 'express';
import { ReadImagesUseCase } from './image/application/use-cases/read-images.use-case.js';
import { AddWaterfallsUseCase } from './image/application/use-cases/add-waterfalls.use-case.js';
import { HeicToJpegConverterService } from './image/infraestructure/services/heic-to-jpeg-converter.service.js';
import { RecogniseImageUseCase } from './image/application/use-cases/recognise-image.use-case.js';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { createBullBoard } from '@bull-board/api';
import { imageQueue } from './image/infraestructure/queues/image-transformation.queue.js';
// Initialize BullMQ queue
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [new BullMQAdapter(imageQueue)],
    serverAdapter: serverAdapter,
});
const app = express();
app.use(express.json());
app.use('/admin/queues', serverAdapter.getRouter());
app.get('/run', async (req, res) => {
    // Logic for receiving source/target paths
    const inputImagesDir = '/Users/albertmontolio/Documents/coding_area/interviews/koerber/input_images';
    const readImagesUseCase = new ReadImagesUseCase(inputImagesDir);
    let imagesPaths = await readImagesUseCase.execute();
    if (!imagesPaths) {
        res.send('sth went wrong');
    }
    const outputImagesDir = '/Users/albertmontolio/Documents/coding_area/interviews/koerber/output_images';
    const heicToJpegConverterService = new HeicToJpegConverterService();
    await heicToJpegConverterService.execute(inputImagesDir);
    imagesPaths = await readImagesUseCase.execute();
    const recogniseImageUseCase = new RecogniseImageUseCase(outputImagesDir);
    for (const imagePath of imagesPaths) {
        console.log('### imagePath', imagePath);
    }
    imagesPaths.forEach(async (imagePath) => {
        await recogniseImageUseCase.execute(imagePath);
    });
    return;
    if (!imagesPaths) {
        res.send('sth went wrong');
    }
    const addWaterfallsUseCase = new AddWaterfallsUseCase('el rincón real', outputImagesDir);
    addWaterfallsUseCase.execute(imagesPaths);
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
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=run.js.map