const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { uploadDir, createPhoto, listPhotos, getPhoto, removePhoto } = require('./photoRepository');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true, credentials: true }));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${sanitizedOriginal}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_UPLOAD_SIZE || `${10 * 1024 * 1024}`, 10),
  },
});

const authUser = process.env.BASIC_AUTH_USER;
const authPass = process.env.BASIC_AUTH_PASS;

function basicAuth(req, res, next) {
  if (!authUser || !authPass) {
    return next();
  }

  if (req.method === 'OPTIONS') {
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Romantic Album"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = Buffer.from(header.split(' ')[1], 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');

  if (username === authUser && password === authPass) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Romantic Album"');
  return res.status(401).json({ error: 'Invalid credentials' });
}

app.use(basicAuth);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

app.post(
  '/photos',
  upload.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const note = req.body.note || null;

    const photo = await createPhoto({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      note,
    });

    const photoResponse = {
      ...photo,
      url: `/photos/${photo.id}/file`,
    };

    res.status(201).json(photoResponse);
  })
);

app.get(
  '/photos',
  asyncHandler(async (req, res) => {
    const photos = (await listPhotos()).map((photo) => ({
      ...photo,
      url: `/photos/${photo.id}/file`,
    }));
    res.json(photos);
  })
);

app.get(
  '/photos/:id/file',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const photo = await getPhoto(id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const filePath = path.join(uploadDir, photo.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.type(photo.mimetype);
    res.sendFile(filePath);
  })
);

app.delete(
  '/photos/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const photo = await getPhoto(id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const filePath = path.join(uploadDir, photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await removePhoto(id);

    res.status(204).send();
  })
);

app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Romantic album backend listening on port ${PORT}`);
});
