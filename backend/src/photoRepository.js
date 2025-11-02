const path = require('path');
const fs = require('fs');
const db = require('./db');

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function createPhoto(metadata) {
  const created_at = new Date().toISOString();
  const payload = { ...metadata, created_at };
  const placeholders = [payload.filename, payload.originalname, payload.mimetype, payload.size, payload.note, payload.created_at];
  const result = await db.run(
    `INSERT INTO photos (filename, originalname, mimetype, size, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    placeholders
  );
  return { id: result.lastID, ...payload };
}

async function listPhotos() {
  return db.all('SELECT * FROM photos ORDER BY datetime(created_at) DESC');
}

async function getPhoto(id) {
  return db.get('SELECT * FROM photos WHERE id = ?', [id]);
}

async function removePhoto(id) {
  return db.run('DELETE FROM photos WHERE id = ?', [id]);
}

module.exports = {
  uploadDir,
  createPhoto,
  listPhotos,
  getPhoto,
  removePhoto,
};
