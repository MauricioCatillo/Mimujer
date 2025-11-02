import { Router } from "express";
import { ReminderService } from "../services/reminderService.js";

const router = Router();
router.get("/log", (_req, res) => {
  const log = ReminderService.getLog();
  res.json(log);
});

export default router;
