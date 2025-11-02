import { Request, Response } from "express";
import { projectSchema } from "../validation/projectSchemas.js";
import { ProjectRepository } from "../services/projectRepository.js";

export const listProjects = (_req: Request, res: Response) => {
  const projects = ProjectRepository.list();
  res.json(projects);
};

export const createProject = (req: Request, res: Response) => {
  try {
    const payload = projectSchema.parse(req.body);
    const project = ProjectRepository.create(payload);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Error inesperado" });
  }
};

export const updateProject = (req: Request, res: Response) => {
  try {
    const existing = ProjectRepository.find(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Ese proyecto ya no existe" });
    }

    const payload = projectSchema.parse(req.body);
    const project = ProjectRepository.update(req.params.id, payload);
    return res.json(project);
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Error inesperado",
    });
  }
};

export const deleteProject = (req: Request, res: Response) => {
  const existing = ProjectRepository.find(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Ese proyecto ya no existe" });
  }

  ProjectRepository.delete(existing.id);
  return res.status(204).send();
};
