import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';
import { v4 as uuid } from 'uuid';

import { addProject, listProjects, removeProject } from './store/projectStore.js';
import { generateScreenshot, ensureGeneratedDir } from './services/screenshotService.js';

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, '../uploads');
const manualDir = path.join(uploadsRoot, 'manual');

const app = express();
const PORT = process.env.PORT || 4000;
const FORM_TOKEN = process.env.FORM_TOKEN || '';
const SCREENSHOT_STRATEGY = process.env.SCREENSHOT_STRATEGY || 'puppeteer';

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsRoot));

async function ensureManualDir() {
  await fs.mkdir(manualDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureManualDir()
      .then(() => cb(null, manualDir))
      .catch((error) => cb(error, manualDir));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

function requireToken(req, res) {
  const headerToken = req.get('x-form-token');
  const bodyToken = req.body?.token;
  if (!FORM_TOKEN) {
    return true;
  }
  if (headerToken === FORM_TOKEN || bodyToken === FORM_TOKEN) {
    return true;
  }
  res.status(401).json({ message: 'Token inválido o ausente' });
  return false;
}

function toPublicPath(absolutePath) {
  const relative = path.relative(uploadsRoot, absolutePath);
  if (relative && !relative.startsWith('..')) {
    return `/uploads/${relative.replace(/\\/g, '/')}`;
  }
  return null;
}

function fromPublicPath(publicPath) {
  if (!publicPath) {
    return null;
  }

  try {
    if (/^https?:\/\//.test(publicPath)) {
      const url = new URL(publicPath);
      publicPath = url.pathname;
    }
  } catch (error) {
    console.warn('[fromPublicPath] URL inválida recibida:', error.message);
    return null;
  }

  if (!publicPath.startsWith('/uploads/')) {
    return null;
  }

  const relative = publicPath.replace('/uploads/', '');
  return path.join(uploadsRoot, relative);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/projects', async (req, res, next) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

app.post('/projects', upload.single('thumbnail'), async (req, res, next) => {
  try {
    if (!requireToken(req, res)) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return;
    }

    const { name, description, url, romanticPurpose, autoGenerateThumbnail } = req.body;

    if (!name || !url) {
      res.status(400).json({ message: 'Los campos "name" y "url" son obligatorios.' });
      return;
    }

    let thumbnailPath = null;

    if (req.file) {
      thumbnailPath = toPublicPath(req.file.path);
    } else if (autoGenerateThumbnail === 'true' || autoGenerateThumbnail === true) {
      if (SCREENSHOT_STRATEGY === 'puppeteer') {
        try {
          const { path: screenshotPath } = await generateScreenshot(url);
          thumbnailPath = toPublicPath(screenshotPath);
        } catch (error) {
          console.error('[POST /projects] No se pudo generar la miniatura:', error.message);
        }
      }
    }

    const now = new Date().toISOString();
    const project = {
      id: uuid(),
      name,
      description: description || '',
      url,
      romanticPurpose: romanticPurpose || '',
      thumbnailPath,
      createdAt: now,
      updatedAt: now
    };

    await addProject(project);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

app.delete('/projects/:id', async (req, res, next) => {
  try {
    if (!requireToken(req, res)) {
      return;
    }
    const removed = await removeProject(req.params.id);
    if (!removed) {
      res.status(404).json({ message: 'Proyecto no encontrado' });
      return;
    }

    if (removed.thumbnailPath) {
      const absoluteThumbnail = fromPublicPath(removed.thumbnailPath);
      if (absoluteThumbnail) {
        await fs.unlink(absoluteThumbnail).catch(() => {});
      }
    }

    res.json({ message: 'Proyecto eliminado', project: removed });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const startServer = async () => {
  await ensureManualDir();
  await ensureGeneratedDir();

  app.listen(PORT, () => {
    console.log(`API de proyectos escuchando en http://localhost:${PORT}`);
  });
};

startServer();
