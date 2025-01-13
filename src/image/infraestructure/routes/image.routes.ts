import express from 'express';
import { container } from '../../../shared/container';
import { ProcessImagesUseCase } from '../../application/use-cases/process-images.use-case';
import { ImageRepository } from '../repositories/image.repository';
import { GetStatsUseCase } from '../../application/use-cases/get-stats.use-case';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const imageRepository = container.resolve(ImageRepository);
    const images = await imageRepository.findAll();
    res.send(images);
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

/**
 * @swagger
 * /images/process:
 *   post:
 *     summary: Process images in the input directory
 *     description: Processes all images in the input directory for categorization, transformation, and object detection
 *     responses:
 *       200:
 *         description: Images processed successfully
 *       500:
 *         description: Server error during processing
 */
router.post('/process', async (_req, res) => {
  const processImagesUseCase = container.resolve(ProcessImagesUseCase);
  await processImagesUseCase.execute();

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
  const getStatsUseCase = container.resolve(GetStatsUseCase);
  const stats = await getStatsUseCase.execute();

  res.status(200).send(stats);
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
