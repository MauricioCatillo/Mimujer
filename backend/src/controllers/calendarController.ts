import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { EventStore } from "../services/eventStore.js";
import { CalendarEvent } from "../types.js";

const reminderSchema = z
  .object({
    method: z.enum(["email", "push"], {
      required_error: "El método de recordatorio es obligatorio",
    }),
    minutesBefore: z
      .number({
        required_error: "Debes indicar cuántos minutos antes avisar",
        invalid_type_error: "El recordatorio debe expresarse en minutos",
      })
      .int()
      .min(5, "El recordatorio debe configurarse al menos 5 minutos antes"),
  })
  .optional();

const baseEventSchema = z.object({
  title: z.string({ required_error: "El título es obligatorio" }).min(1, "El título es obligatorio"),
  start: z.string({ required_error: "La fecha de inicio es obligatoria" }),
  end: z.string({ required_error: "La fecha de fin es obligatoria" }),
  notes: z.string({ required_error: "Comparte algunas notas cariñosas" }).min(1),
  tag: z.string({ required_error: "Selecciona una etiqueta" }).min(1),
  reminder: reminderSchema,
});

const parseEventDates = (input: z.infer<typeof baseEventSchema>) => {
  const startDate = new Date(input.start);
  const endDate = new Date(input.end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Las fechas deben tener un formato válido");
  }

  const now = new Date();
  if (startDate < now) {
    throw new Error("La fecha de inicio debe ser en el futuro");
  }

  if (endDate <= startDate) {
    throw new Error("La fecha de finalización debe ser posterior al inicio");
  }

  return { startDate, endDate };
};

const formatEvent = (input: z.infer<typeof baseEventSchema>, id: string): CalendarEvent => ({
  id,
  title: input.title.trim(),
  start: new Date(input.start).toISOString(),
  end: new Date(input.end).toISOString(),
  notes: input.notes.trim(),
  tag: input.tag.trim(),
  reminder: input.reminder ? { ...input.reminder } : undefined,
});

export const listEvents = async (_req: Request, res: Response) => {
  const events = await EventStore.getAll();
  return res.json(events);
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const payload = baseEventSchema.parse(req.body);
    parseEventDates(payload);

    const events = await EventStore.getAll();
    const event = formatEvent(payload, nanoid());
    events.push(event);
    await EventStore.saveAll(events);

    return res.status(201).json(event);
  } catch (error) {
    return handleControllerError(error, res);
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const payload = baseEventSchema.parse(req.body);
    parseEventDates(payload);

    const { id } = req.params;
    const events = await EventStore.getAll();
    const index = events.findIndex((event) => event.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "No encontramos ese recuerdo" });
    }

    const updated = formatEvent(payload, id);
    events[index] = updated;
    await EventStore.saveAll(events);

    return res.json(updated);
  } catch (error) {
    return handleControllerError(error, res);
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const events = await EventStore.getAll();
  const filtered = events.filter((event) => event.id !== id);

  if (filtered.length === events.length) {
    return res.status(404).json({ message: "Ese evento ya no existe" });
  }

  await EventStore.saveAll(filtered);
  return res.status(204).send();
};

const handleControllerError = (error: unknown, res: Response) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: error.errors.map((err) => err.message).join(". ") });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: "Ocurrió un error inesperado" });
};
