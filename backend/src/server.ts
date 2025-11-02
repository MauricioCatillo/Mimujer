import cors from "cors";
import express from "express";
import path from "path";
import { env } from "./config/env.js";
import eventsRouter from "./routes/events.js";
import photosRouter from "./routes/photos.js";
import projectsRouter from "./routes/projects.js";
import remindersRouter from "./routes/reminders.js";
import authRouter from "./routes/auth.js";
import { UserService } from "./services/userService.js";
import { ReminderService } from "./services/reminderService.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    credentials: false,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.join(env.uploadsDir);
app.use("/uploads", express.static(uploadsPath));

app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/photos", photosRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/reminders", remindersRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

UserService.ensureSeedUser(env.initialUserEmail, env.initialUserPassword);
ReminderService.start();

const port = env.port;

app.listen(port, () => {
  console.log(`Portal romántico escuchando en el puerto ${port}`);
});

export default app;
