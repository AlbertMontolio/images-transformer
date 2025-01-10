import express from 'express';
import { dependencies } from '../../utils/dependencies';

export const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const images = await dependencies.imageRepository.findAll();
    res.send(images);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch images' });
  }
});

router.get('/:id', async (req, res) => {
  const idParam = req.params.id; // Use req.params.id
  const imageId = parseInt(idParam, 10);

  if (isNaN(imageId)) {
    res.status(400).send({ error: 'ID must be a valid number' });
    return;
  }

  try {
    const image = await dependencies.imageRepository.findOne(imageId);
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
