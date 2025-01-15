import express from 'express';
import { container } from '../../../shared/container';
import { ProcessImagesUseCase } from '../../application/use-cases/process-images.use-case';
import { ImageRepository } from '../repositories/image.repository';
import { GetStatsUseCase } from '../../application/use-cases/get-stats.use-case';
import { ProjectRepository } from '../repositories/project.repository';

const router = express.Router();

interface ErrorResponse {
  error: string;
  details?: unknown;
}

router.get('/', async (_req, res) => {
  try {
    console.log('### before imageRepository', new Date().toISOString());
    const imageRepository = container.resolve(ImageRepository);
    const images = await imageRepository.findAll();
    console.log('### images.length', images.length);
    console.log('### after imageRepository', new Date().toISOString());
    res.json(images);
  } catch (err) {
    console.error('Error fetching images:', err);
    const response: ErrorResponse = { 
      error: 'Failed to fetch images',
      details: process.env.NODE_ENV === 'development' ? err : undefined
    };
    res.status(500).json(response);
  }
});

/**
 * @swagger
 * /images/process:
 *   post:
 *     summary: Process images in the input directory
 *     description: Processes all images in the input directory for categorization, transformation, and object detection
 *     responses, and stores it in the output directory provided as env var:
 *       200:
 *         description: Images processed successfully
 *       500:
 *         description: Server error during processing
 */
router.post('/process', async (_req, res) => {
  const projectRepository = container.resolve(ProjectRepository);
  const project = await projectRepository.create({
    name: 'iphone personal pictures',
  });
  const processImagesUseCase = container.resolve(ProcessImagesUseCase);
  await processImagesUseCase.execute(project.id);

  res.status(200).send();
});

/**
 * @swagger
 * /images/stats:
 *   get:
 *     summary: Get image processing statistics
 *     description: Retrieves statistics about processed images including filters used and transformations
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalImages:
 *                   type: number
 *                 filterStats:
 *                   type: object
 *                 averageProcessingTime:
 *                   type: number
 *       500:
 *         description: Server error while retrieving stats
 */
router.get('/stats', async (_req, res) => {
  try {
    const getStatsUseCase = container.resolve(GetStatsUseCase);
    const stats = await getStatsUseCase.execute();
    res.status(200).json(stats);
  } catch (err) {
    const response: ErrorResponse = {
      error: 'Failed to fetch stats',
      details: process.env.NODE_ENV === 'development' ? err : undefined
    };
    console.error('Error fetching stats:', err);
    res.status(500).json(response);
  }
});

router.get('/:id', async (req, res) => {
  const idParam = req.params.id;
  const imageId = parseInt(idParam, 10);

  if (isNaN(imageId)) {
    res.status(400).json({ error: 'ID must be a valid number' });
    return;
  }

  try {
    const imageRepository = container.resolve(ImageRepository);
    const image = await imageRepository.findOne(imageId);
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    res.send(image);
  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).json({ error: 'Error processing image' });
  }
});

export default router;
