import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { createEvent, deleteEvent, listEvents, updateEvent } from "../src/controllers/calendarController.js";
import { EventStore } from "../src/services/eventStore.js";
import type { CalendarEvent } from "../src/types.js";

const createMockResponse = () => {
  const res: Partial<Response> & {
    statusCode: number;
    jsonPayload: unknown;
  } = {
    statusCode: 200,
    jsonPayload: undefined,
    status(status) {
      this.statusCode = status;
      return this as Response;
    },
    json(payload) {
      this.jsonPayload = payload;
      return this as Response;
    },
    send() {
      return this as Response;
    },
  };
  return res as Response & { statusCode: number; jsonPayload: unknown };
};

describe("calendarController", () => {
  const futureRange = () => {
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(Date.now() + 2 * 60 * 60 * 1000);
    return { start, end };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("listEvents devuelve todos los eventos", async () => {
    const sample: CalendarEvent[] = [
      {
        id: "1",
        title: "Cena",
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        notes: "Velas y música",
        tag: "Cita",
      },
    ];

    vi.spyOn(EventStore, "getAll").mockResolvedValue(sample);
    const res = createMockResponse();

    await listEvents({} as Request, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual(sample);
  });

  it("createEvent guarda un evento válido", async () => {
    const { start, end } = futureRange();
    const events: CalendarEvent[] = [];
    vi.spyOn(EventStore, "getAll").mockResolvedValue(events);
    const saveSpy = vi.spyOn(EventStore, "saveAll").mockResolvedValue();

    const req = {
      body: {
        title: "Paseo romántico",
        start: start.toISOString(),
        end: end.toISOString(),
        notes: "Llevar manta y chocolate caliente",
        tag: "Cita",
        reminder: {
          method: "email",
          minutesBefore: 30,
        },
      },
    } as Request;
    const res = createMockResponse();

    await createEvent(req, res);

    expect(res.statusCode).toBe(201);
    const payload = res.jsonPayload as CalendarEvent;
    expect(payload).toMatchObject({
      title: "Paseo romántico",
      notes: expect.stringContaining("chocolate"),
      reminder: { method: "email", minutesBefore: 30 },
    });
    expect(saveSpy).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ title: "Paseo romántico" })]));
  });

  it("createEvent rechaza fechas pasadas", async () => {
    const past = new Date(Date.now() - 60 * 1000);
    vi.spyOn(EventStore, "getAll").mockResolvedValue([]);

    const req = {
      body: {
        title: "Sorpresa",
        start: past.toISOString(),
        end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        notes: "No debería guardarse",
        tag: "Sorpresa",
      },
    } as Request;
    const res = createMockResponse();

    await createEvent(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toMatchObject({ message: expect.stringContaining("futuro") });
  });

  it("updateEvent devuelve 404 si no existe", async () => {
    const { start, end } = futureRange();
    vi.spyOn(EventStore, "getAll").mockResolvedValue([]);

    const req = {
      params: { id: "missing" },
      body: {
        title: "Nueva cita",
        start: start.toISOString(),
        end: end.toISOString(),
        notes: "Será inolvidable",
        tag: "Cita",
      },
    } as unknown as Request;
    const res = createMockResponse();

    await updateEvent(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.jsonPayload).toEqual({ message: "No encontramos ese recuerdo" });
  });

  it("deleteEvent elimina registros existentes", async () => {
    const existing: CalendarEvent[] = [
      {
        id: "abc",
        title: "Aniversario",
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        notes: "Reserva restaurante",
        tag: "Aniversario",
      },
    ];
    const saveSpy = vi.spyOn(EventStore, "saveAll").mockResolvedValue();
    vi.spyOn(EventStore, "getAll").mockResolvedValue(existing);

    const req = { params: { id: "abc" } } as unknown as Request;
    const res = createMockResponse();

    await deleteEvent(req, res);

    expect(res.statusCode).toBe(204);
    expect(saveSpy).toHaveBeenCalledWith([]);
  });
});
