import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, unlinkSync, rmSync, renameSync } from 'fs';
import Database from 'better-sqlite3';
import AdmZip from 'adm-zip';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;

const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(__dirname, '..', 'uploads');
const photoDir = path.join(uploadsDir, 'photos');
const sitesDir = path.join(uploadsDir, 'sites');
const tmpDir = path.join(uploadsDir, 'tmp');

[photoDir, sitesDir, tmpDir, dataDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

const db = new Database(path.join(dataDir, 'mimujer.db'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    description TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    note TEXT,
    due_date TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS web_experiences (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    folder_name TEXT NOT NULL,
    preview_image TEXT
  )
`).run();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/media/photos', express.static(photoDir));
app.use('/sites', express.static(sitesDir));

const sanitizeFileName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'archivo';

const photoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, photoDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${unique}${ext}`);
  }
});

const photoUpload = multer({
  storage: photoStorage,
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imagenes romanticas y llenas de amor.'));
    }
  }
});

const siteUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, tmpDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${sanitizeFileName(file.originalname.replace(ext, ''))}${ext}`);
    }
  })
});

const runQuery = (stmt, params = {}) => {
  try {
    return stmt.run(params);
  } catch (error) {
    console.error('Database error', error);
    throw error;
  }
};

const getAll = (stmt) => {
  try {
    return stmt.all();
  } catch (error) {
    console.error('Database error', error);
    throw error;
  }
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Amor infinito listo para compartir.' });
});

app.get('/api/calendar', (_req, res) => {
  const events = getAll(db.prepare('SELECT * FROM calendar_events ORDER BY event_date ASC')).map((event) => ({
    id: event.id,
    title: event.title,
    eventDate: event.event_date,
    description: event.description
  }));
  res.json(events);
});

app.post('/api/calendar', (req, res) => {
  const { title, eventDate, description } = req.body;
  if (!title || !eventDate) {
    return res.status(400).json({ message: 'El evento necesita titulo y fecha.' });
  }
  const id = nanoid();
  runQuery(
    db.prepare(
      'INSERT INTO calendar_events (id, title, event_date, description) VALUES (@id, @title, @eventDate, @description)'
    ),
    { id, title, eventDate, description: description || '' }
  );
  res.status(201).json({ id, title, eventDate, description: description || '' });
});

app.delete('/api/calendar/:id', (req, res) => {
  const { id } = req.params;
  runQuery(db.prepare('DELETE FROM calendar_events WHERE id = ?'), id);
  res.json({ id });
});

app.get('/api/reminders', (_req, res) => {
  const reminders = getAll(db.prepare('SELECT * FROM reminders ORDER BY due_date ASC')).map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    note: reminder.note,
    dueDate: reminder.due_date
  }));
  res.json(reminders);
});

app.post('/api/reminders', (req, res) => {
  const { title, note, dueDate } = req.body;
  if (!title || !dueDate) {
    return res.status(400).json({ message: 'El recordatorio necesita titulo y fecha.' });
  }
  const id = nanoid();
  runQuery(
    db.prepare('INSERT INTO reminders (id, title, note, due_date) VALUES (@id, @title, @note, @dueDate)'),
    { id, title, note: note || '', dueDate }
  );
  res.status(201).json({ id, title, note: note || '', dueDate });
});

app.delete('/api/reminders/:id', (req, res) => {
  const { id } = req.params;
  runQuery(db.prepare('DELETE FROM reminders WHERE id = ?'), id);
  res.json({ id });
});

app.get('/api/photos', (_req, res) => {
  const photos = getAll(db.prepare('SELECT * FROM photos ORDER BY created_at DESC'));
  const enhanced = photos.map((photo) => ({
    ...photo,
    url: `/media/photos/${photo.file_name}`
  }));
  res.json(enhanced);
});

app.post('/api/photos', photoUpload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Necesitamos una foto para llenar de recuerdos el album.' });
  }
  const { title, description } = req.body;
  const id = nanoid();
  const createdAt = new Date().toISOString();
  runQuery(
    db.prepare(
      'INSERT INTO photos (id, title, description, file_name, original_name, created_at) VALUES (@id, @title, @description, @fileName, @originalName, @createdAt)'
    ),
    {
      id,
      title: title || '',
      description: description || '',
      fileName: req.file.filename,
      originalName: req.file.originalname,
      createdAt
    }
  );
  res.status(201).json({
    id,
    title: title || '',
    description: description || '',
    url: `/media/photos/${req.file.filename}`,
    createdAt
  });
});

app.delete('/api/photos/:id', (req, res) => {
  const { id } = req.params;
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id);
  if (!photo) {
    return res.status(404).json({ message: 'La fotografia ya no existe, pero el recuerdo vive en el corazon.' });
  }
  runQuery(db.prepare('DELETE FROM photos WHERE id = ?'), id);
  try {
    unlinkSync(path.join(photoDir, photo.file_name));
  } catch (error) {
    console.warn('No se pudo eliminar el archivo fisico:', error);
  }
  res.json({ id });
});

const moveFile = (from, to) => {
  renameSync(from, to);
};

const extractWebsite = (filePath, destination) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.zip') {
    const zip = new AdmZip(filePath);
    zip.extractAllTo(destination, true);
    return { removeSource: true };
  }

  if (ext === '.html' || ext === '.htm') {
    moveFile(filePath, path.join(destination, 'index.html'));
    return { removeSource: false };
  }

  throw new Error('Formato de archivo no soportado. Usa .zip o .html');
};

app.get('/api/websites', (_req, res) => {
  const sites = getAll(db.prepare('SELECT * FROM web_experiences ORDER BY title ASC'));
  const enriched = sites.map((site) => ({
    ...site,
    siteUrl: `/sites/${site.folder_name}/`,
    previewImageUrl: site.preview_image ? `/sites/${site.folder_name}/${site.preview_image}` : null
  }));
  res.json(enriched);
});

app.post(
  '/api/websites',
  siteUpload.fields([
    { name: 'siteArchive', maxCount: 1 },
    { name: 'previewImage', maxCount: 1 }
  ]),
  (req, res) => {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Necesitamos un titulo lleno de magia para tu experiencia.' });
    }
    if (!req.files || !req.files.siteArchive?.length) {
      return res.status(400).json({ message: 'Sube un archivo .zip o .html con tu pagina especial.' });
    }

    const archiveFile = req.files.siteArchive[0];
    const previewImageFile = req.files.previewImage?.[0];

    const id = nanoid();
    const folderName = `${Date.now()}-${id}`;
    const destination = path.join(sitesDir, folderName);
    mkdirSync(destination, { recursive: true });

    let extractionResult;
    try {
      extractionResult = extractWebsite(archiveFile.path, destination);
    } catch (error) {
      rmSync(destination, { recursive: true, force: true });
      try {
        unlinkSync(archiveFile.path);
      } catch (unlinkError) {
        console.warn('No se pudo limpiar el archivo temporal del sitio:', unlinkError);
      }
      if (previewImageFile) {
        unlinkSync(previewImageFile.path);
      }
      return res.status(400).json({ message: error.message });
    }

    if (extractionResult?.removeSource) {
      try {
        unlinkSync(archiveFile.path);
      } catch (error) {
        console.warn('No se pudo eliminar el archivo temporal:', error);
      }
    }

    const hasIndexHtml = existsSync(path.join(destination, 'index.html')) || existsSync(path.join(destination, 'index.htm'));
    if (!hasIndexHtml) {
      rmSync(destination, { recursive: true, force: true });
      if (previewImageFile) {
        unlinkSync(previewImageFile.path);
      }
      return res.status(400).json({ message: 'Tu experiencia necesita un archivo index.html como punto de entrada.' });
    }

    let previewFileName = null;
    if (previewImageFile) {
      const ext = path.extname(previewImageFile.originalname) || '.jpg';
      previewFileName = `preview${ext}`;
      moveFile(previewImageFile.path, path.join(destination, previewFileName));
    }

    runQuery(
      db.prepare(
        'INSERT INTO web_experiences (id, title, description, folder_name, preview_image) VALUES (@id, @title, @description, @folderName, @previewImage)'
      ),
      { id, title, description: description || '', folderName, previewImage: previewFileName }
    );

    res.status(201).json({
      id,
      title,
      description: description || '',
      siteUrl: `/sites/${folderName}/`,
      previewImageUrl: previewFileName ? `/sites/${folderName}/${previewFileName}` : null
    });
  }
);

app.delete('/api/websites/:id', (req, res) => {
  const { id } = req.params;
  const site = db.prepare('SELECT * FROM web_experiences WHERE id = ?').get(id);
  if (!site) {
    return res.status(404).json({ message: 'Esta experiencia ya no existe.' });
  }
  runQuery(db.prepare('DELETE FROM web_experiences WHERE id = ?'), id);
  try {
    rmSync(path.join(sitesDir, site.folder_name), { recursive: true, force: true });
  } catch (error) {
    console.warn('No se pudo eliminar la carpeta del sitio:', error);
  }
  res.json({ id });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Algo salio mal, pero el amor todo lo puede. Intenta de nuevo.' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
