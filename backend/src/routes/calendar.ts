import { Router } from "express";
import { createEvent, deleteEvent, listEvents, updateEvent } from "../controllers/calendarController.js";

const router = Router();

router.get("/events", listEvents);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

export default router;
