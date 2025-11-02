import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createPhoto, deletePhoto, listPhotos } from "../controllers/photoController.js";
import { env } from "../config/env.js";

const uploadsDir = path.join(env.uploadsDir, "photos");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${unique}${extension}`);
  },
});

const upload = multer({ storage });

const router = Router();

router.get("/", listPhotos);
router.post("/", upload.single("file"), createPhoto);
router.delete("/:id", deletePhoto);

export default router;
