import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

import eventsRouter from './routes/events.js';
import remindersRouter from './routes/reminders.js';
import photosRouter from './routes/photos.js';
import projectsRouter from './routes/projects.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/events', eventsRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/photos', photosRouter);
app.use('/api/projects', projectsRouter);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Unexpected error', detail: error.message });
});

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`API romántica lista en http://localhost:${port}`);
});
