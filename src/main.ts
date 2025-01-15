import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import 'reflect-metadata';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js'
import { createBullBoard } from '@bull-board/api'
import { ImageCategorizationQueue } from './image/infraestructure/queues/image-categorization.queue';
import { ImageDetectionQueue } from './image/infraestructure/queues/image-detection.queue';
import imagesRoutes from './image/infraestructure/routes/image.routes';
import swaggerUi from 'swagger-ui-express';
import { specs } from './shared/swagger/swagger.config';
import { ImageTransformationQueue } from './image/infraestructure/queues/image-transformation.queue';

dotenv.config();

// create express adapter for bull-dashboard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// Initialize queues in a more maintainable way
const queues = {
  categorization: ImageCategorizationQueue.getInstance(),
  transformation: ImageTransformationQueue.getInstance(),
  detection: ImageDetectionQueue.getInstance(),
} as const;

createBullBoard({
    queues: [
        new BullMQAdapter(queues.categorization),
        new BullMQAdapter(queues.transformation),
        new BullMQAdapter(queues.detection),
    ],
    serverAdapter: serverAdapter,
});

const app = express();
app.use(express.json());

export const getCorsOrigin = (): string => process.env.CORS_ORIGIN || '*';

// Move CORS configuration here, before routes
const CORS_ORIGIN = getCorsOrigin();
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Then register routes
app.use('/admin/queues', serverAdapter.getRouter());
app.use('/images', imagesRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

export const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    
    // Remove CORS configuration from here since we moved it above
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`Queue Dashboard available at http://localhost:${PORT}/admin/queues`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Change the type declaration
let server: ReturnType<typeof app.listen>;

// Update the IIFE to properly assign the server
(async () => {
  const serverPromise = await startServer();
  if (serverPromise) {
    server = serverPromise;
  }
})();

export { app, server };

export const shutdown = async () => {
  console.log('Shutting down gracefully...');

  try {
    // Close all queues
    await Promise.all([
      queues.categorization.close(),
      queues.transformation.close(),
      queues.detection.close(),
    ]);
    console.log('Queues closed.');

    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
