import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { EventStore } from "../services/eventStore.js";
import { CalendarEvent, ReminderMethod } from "../types.js";

interface ReminderPayload {
  method: ReminderMethod;
  minutesBefore: number;
}

interface EventPayload {
  title: string;
  start: string;
  end: string;
  notes: string;
  tag: string;
  reminder?: ReminderPayload;
}

const assertString = (value: unknown, message: string): string => {
  if (typeof value !== "string") {
    throw new Error(message);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(message);
  }

  return trimmed;
};

const validateReminder = (value: unknown): ReminderPayload => {
  if (value === undefined) {
    throw new Error("El método de recordatorio es obligatorio");
  }

  if (value === null || typeof value !== "object") {
    throw new Error("El recordatorio debe expresarse en minutos");
  }

  const record = value as Record<string, unknown>;

  const method = record.method;
  if (method === undefined || (method !== "email" && method !== "push")) {
    throw new Error("El método de recordatorio es obligatorio");
  }

  if (!record.hasOwnProperty("minutesBefore")) {
    throw new Error("Debes indicar cuántos minutos antes avisar");
  }

  const minutes = record.minutesBefore;
  if (typeof minutes !== "number" || Number.isNaN(minutes) || !Number.isInteger(minutes)) {
    throw new Error("El recordatorio debe expresarse en minutos");
  }

  if (minutes < 5) {
    throw new Error("El recordatorio debe configurarse al menos 5 minutos antes");
  }

  return { method, minutesBefore: minutes };
};

const validateEventPayload = (body: unknown): EventPayload => {
  if (body === null || typeof body !== "object") {
    throw new Error("Los datos del evento son obligatorios");
  }

  const record = body as Record<string, unknown>;

  const title = assertString(record.title, "El título es obligatorio");
  const start = assertString(record.start, "La fecha de inicio es obligatoria");
  const end = assertString(record.end, "La fecha de fin es obligatoria");
  const notes = assertString(record.notes, "Comparte algunas notas cariñosas");
  const tag = assertString(record.tag, "Selecciona una etiqueta");

  let reminder: ReminderPayload | undefined;
  if (record.reminder !== undefined) {
    reminder = validateReminder(record.reminder);
  }

  return { title, start, end, notes, tag, reminder };
};

const parseEventDates = (input: EventPayload) => {
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

const formatEvent = (input: EventPayload, id: string): CalendarEvent => ({
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
    const payload = validateEventPayload(req.body);
    parseEventDates(payload);

    const events = await EventStore.getAll();
    const event = formatEvent(payload, randomUUID());
    events.push(event);
    await EventStore.saveAll(events);

    return res.status(201).json(event);
  } catch (error) {
    return handleControllerError(error, res);
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const payload = validateEventPayload(req.body);
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
  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: "Ocurrió un error inesperado" });
};
