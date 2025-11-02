import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { ReminderService } from "../services/reminderService.js";

const router = Router();

router.use(authenticate);
router.get("/log", (_req, res) => {
  const log = ReminderService.getLog();
  res.json(log);
});

export default router;
