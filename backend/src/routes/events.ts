import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { createEvent, deleteEvent, listEvents, updateEvent } from "../controllers/eventController.js";

const router = Router();

router.use(authenticate);
router.get("/", listEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
