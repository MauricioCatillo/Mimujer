import { Router } from 'express';
import prisma from '../db/client.js';

const router = Router();

router.get('/', async (_req, res) => {
  const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
  res.json(events);
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, date } = req.body;
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date)
      }
    });
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

export default router;
