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
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch images' });
  }
});


router.post('/process', async (_req, res) => {
  const processImagesUseCase = container.resolve(ProcessImagesUseCase);
  await processImagesUseCase.execute();

  res.status(200).send();
});

router.get('/stats', async (_req, res) => {
  const getStatsUseCase = container.resolve(GetStatsUseCase);
  const stats = await getStatsUseCase.execute();

  res.status(200).send(stats);
});

router.get('/:id', async (req, res) => {
  const idParam = req.params.id;
  const imageId = parseInt(idParam, 10);

  if (isNaN(imageId)) {
    res.status(400).send({ error: 'ID must be a valid number' });
    return;
  }

  try {
    const imageRepository = container.resolve(ImageRepository);
    const image = await imageRepository.findOne(imageId);
    if (!image) {
      res.status(404).send({ error: 'Image not found' });
      return;
    }
    res.send(image);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch image' });
  }
});

export default router;
