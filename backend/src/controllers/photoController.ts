import { promises as fs } from "fs";
import path from "path";
import { Request, Response } from "express";
import { photoSchema } from "../validation/photoSchemas.js";
import { PhotoRepository } from "../services/photoRepository.js";
import { env } from "../config/env.js";

const uploadsDir = env.uploadsDir;

export const listPhotos = (_req: Request, res: Response) => {
  const photos = PhotoRepository.list();
  res.json(photos);
};

export const createPhoto = async (req: Request, res: Response) => {
  try {
    const metadata = photoSchema.parse(req.body);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Necesitas subir una imagen" });
    }

    const photo = PhotoRepository.create({
      title: metadata.title,
      description: metadata.description,
      takenAt: metadata.takenAt,
      fileName: file.filename,
    });

    res.status(201).json(photo);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Error inesperado" });
  }
};

export const deletePhoto = async (req: Request, res: Response) => {
  const photo = PhotoRepository.find(req.params.id);
  if (!photo) {
    return res.status(404).json({ message: "No encontramos esa fotografía" });
  }

  PhotoRepository.delete(photo.id);
  const filePath = path.join(uploadsDir, "photos", photo.fileName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("No pudimos eliminar la foto", error);
    }
  }

  res.status(204).send();
};
