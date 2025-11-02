import express from "express";
import calendarRouter from "./routes/calendar.js";

const app = express();

app.use(express.json());
app.use("/api", calendarRouter);

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Calendario romántico escuchando en el puerto ${port}`);
});

export default app;
