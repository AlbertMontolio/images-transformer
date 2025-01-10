import express, { Response, Request, Router } from 'express';
import { dependencies } from '../../utils/dependencies';
import { z } from 'zod';

const router = express.Router();

const idSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number")
});

router.get('/', async (_req, res) => {
  try {
    const images = await dependencies.imageRepository.findAll();
    res.send(images);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch images' }); 
  }
});

router.get('/:id', async (req, res) => {
  const imageId = +req.query.id;
  if (imageId === undefined) {
    res.status(400).send({ error: 'ID is required' });
    return
  }
  // Fetch the image
  const image = await dependencies.imageRepository.findOne(imageId);

  res.send(image);
});

export default router;
