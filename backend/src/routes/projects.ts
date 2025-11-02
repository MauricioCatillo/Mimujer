import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "../controllers/projectController.js";

const router = Router();
router.use(authenticate);

router.get("/", listProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
