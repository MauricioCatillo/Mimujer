import { Request, Response } from "express";
import { differenceInMinutes, isAfter } from "date-fns";
import { eventSchema } from "../validation/eventSchemas.js";
import { EventRepository } from "../services/eventRepository.js";

const parsePayload = (body: unknown) => {
  const payload = eventSchema.parse(body);
  const start = new Date(payload.start);
  const end = new Date(payload.end);

  if (!isAfter(end, start)) {
    throw new Error("La fecha de finalización debe ser posterior al inicio");
  }

  if (payload.reminder) {
    const diff = differenceInMinutes(start, new Date());
    if (diff < payload.reminder.minutesBefore) {
      throw new Error("El recordatorio debe programarse antes de la fecha del evento");
    }
  }

  return payload;
};

const formatError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

export const listEvents = (_req: Request, res: Response) => {
  const events = EventRepository.list();
  res.json(events);
};

export const createEvent = (req: Request, res: Response) => {
  try {
    const payload = parsePayload(req.body);
    const event = EventRepository.create(payload);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: formatError(error) });
  }
};

export const updateEvent = (req: Request, res: Response) => {
  try {
    const existing = EventRepository.find(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "No encontramos ese recuerdo" });
    }

    const payload = parsePayload(req.body);
    const event = EventRepository.update(req.params.id, payload);
    return res.json(event);
  } catch (error) {
    return res.status(400).json({ message: formatError(error) });
  }
};

export const deleteEvent = (req: Request, res: Response) => {
  const existing = EventRepository.find(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Ese evento ya no existe" });
  }

  EventRepository.delete(req.params.id);
  return res.status(204).send();
};
