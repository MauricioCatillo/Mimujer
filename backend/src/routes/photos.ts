import { Router } from 'express';
import prisma from '../db/client.js';

const router = Router();

router.get('/', async (_req, res) => {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(photos);
});

router.post('/', async (req, res, next) => {
  try {
    const { title, url, description } = req.body;
    const photo = await prisma.photo.create({
      data: {
        title,
        url,
        description
      }
    });
    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
});

export default router;
