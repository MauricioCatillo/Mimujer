import { Router } from 'express';
import prisma from '../db/client.js';

const router = Router();

router.get('/', async (_req, res) => {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(projects);
});

router.post('/', async (req, res, next) => {
  try {
    const { name, summary, status } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        summary,
        status: status ?? 'draft'
      }
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

export default router;
