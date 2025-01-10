import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';

import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { createBullBoard } from '@bull-board/api'

import { ImageCategorizationQueue } from './image/infraestructure/queues/image-categorization.queue';
import { imageTransformationQueue } from './image/infraestructure/queues/image-transformation-old.queue';
import { dependencies } from './image/utils/dependencies';
import imagesRoutes from './image/infraestructure/routes/image.routes';

dotenv.config();

// create express adapter for bull-dashboard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// create dashboard to monitor and manage queues with bull-dashboard
const imageCategorizationQueue = ImageCategorizationQueue.getInstance().getQueue()
createBullBoard({
    queues: [new BullMQAdapter(imageCategorizationQueue), new BullMQAdapter(imageTransformationQueue)],
    serverAdapter: serverAdapter,
});

const app = express();
app.use(express.json());


// setup endpoint for bull-dashboard
app.use('/admin/queues', serverAdapter.getRouter());

app.use('/images', imagesRoutes);

app.get('/stats', async (_req, res) => {
    const stats = dependencies.getStatsUseCase.execute()
    res.send(stats);
});

app.get('/remove', async (_req, res) => {
    await dependencies.imageRepository.deleteAllImagesAndRelations()
    res.send();
});

export const getCorsOrigin = (): string => process.env.CORS_ORIGIN || '*';

export const startServer = () => {
    const PORT = process.env.PORT || 3000;
    const CORS_ORIGIN = getCorsOrigin();
    // allow requests from nextjs app in development
    app.use(cors({
        origin: CORS_ORIGIN,
    }));

    const server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    });

    return server;
}

const server = startServer()

export { app, server };

export const shutdown = async () => {
    console.log('Shutting down gracefully...');

    try {
        await imageCategorizationQueue.close();
        await imageTransformationQueue.close();
        console.log('Queues closed.');

        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });

    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1); // Exit with an error code
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
