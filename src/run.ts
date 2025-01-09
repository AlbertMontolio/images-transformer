import express from 'express';
import cors from 'cors'

import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { createBullBoard } from '@bull-board/api'

import { imageCategorizationQueue } from './image/infraestructure/queues/image-categorization.queue.js';
import { imageTransformationQueue } from './image/infraestructure/queues/image-transformation.queue.js';
import { ProcessImagesUseCase } from './image/application/use-cases/process-images.use-case.js';
import { ImageRepository } from './image/infraestructure/repositories/image.repository.js';
import { GetStatsUseCase } from './image/application/use-cases/get-stats.use-case.js';

// create express adapter for bull-dashboard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// create dashboard to monitor and manage queues with bull-dashboard
createBullBoard({
    queues: [new BullMQAdapter(imageCategorizationQueue), new BullMQAdapter(imageTransformationQueue)],
    serverAdapter: serverAdapter,
});

const app = express();
app.use(express.json());

// allow requests from nextjs app in development
app.use(cors({
    origin: 'http://localhost:3001',
}));

// setup endpoint for bull-dashboard
app.use('/admin/queues', serverAdapter.getRouter());

app.post('/process', async (_req, res) => {
    const processImagesUseCase = new ProcessImagesUseCase()
    await processImagesUseCase.execute();

    res.status(200).send();
});

app.get('/images', async (_req, res) => {
    const imageRepository = new ImageRepository()
    const images = await imageRepository.findAll()

    res.send(images);
});

app.get('/images/:id', async (req, res) => {
    const imageId = req.params.id;
    const imageRepository = new ImageRepository()
    const image = await imageRepository.findOne(+imageId)

    res.send(image);
});

app.get('/stats', async (req, res) => {
    const getStatsUseCase = new GetStatsUseCase()
    const stats = getStatsUseCase.execute()
    res.send(stats);
});

app.get('/remove', async (req, res) => {
    const imageRepository = new ImageRepository()
    await imageRepository.deleteAllImagesAndRelations()
    res.send();
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
