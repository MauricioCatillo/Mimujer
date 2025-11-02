import { Router } from 'express';
import prisma from '../db/client.js';

const router = Router();

router.get('/', async (_req, res) => {
  const reminders = await prisma.reminder.findMany({ orderBy: { remindAt: 'asc' } });
  res.json(reminders);
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, remindAt } = req.body;
    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        remindAt: new Date(remindAt)
      }
    });
    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
});

export default router;
