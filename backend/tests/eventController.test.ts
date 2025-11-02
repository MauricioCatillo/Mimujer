import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { createEvent, deleteEvent, listEvents, updateEvent } from "../src/controllers/eventController.js";
import { EventRepository } from "../src/services/eventRepository.js";

vi.mock("../src/services/eventRepository.js", () => ({
  EventRepository: {
    list: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const createMockResponse = () => {
  const res: Partial<Response> & { statusCode: number; jsonPayload?: unknown } = {
    statusCode: 200,
    jsonPayload: undefined,
    status(code: number) {
      this.statusCode = code;
      return this as Response;
    },
    json(payload: unknown) {
      this.jsonPayload = payload;
      return this as Response;
    },
    send() {
      return this as Response;
    },
  };

  return res as Response & { statusCode: number; jsonPayload?: unknown };
};

describe("eventController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listEvents delega en el repositorio", () => {
    const events = [{ id: "1", title: "Cena", start: "2024-01-01", end: "2024-01-02", notes: "", tag: "Cita" }];
    vi.mocked(EventRepository.list).mockReturnValue(events as any);
    const res = createMockResponse();

    listEvents({} as Request, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual(events);
  });

  it("createEvent valida y crea eventos", () => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    const created = { id: "abc", title: "Paseo", start, end, notes: "", tag: "Cita" };
    vi.mocked(EventRepository.create).mockReturnValue(created as any);

    const req = {
      body: {
        title: "Paseo",
        start,
        end,
        notes: "Flores y sorpresas",
        tag: "Cita",
      },
    } as Request;

    const res = createMockResponse();
    createEvent(req, res);

    expect(EventRepository.create).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res.jsonPayload).toEqual(created);
  });

  it("createEvent responde error con payload inválido", () => {
    const req = {
      body: { title: "", start: "fecha", end: "fecha", notes: "", tag: "" },
    } as Request;
    const res = createMockResponse();

    createEvent(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toMatchObject({ message: expect.any(String) });
  });

  it("updateEvent devuelve 404 si no existe", () => {
    vi.mocked(EventRepository.find).mockReturnValue(undefined);
    const req = {
      params: { id: "missing" },
      body: {
        title: "Nuevo",
        start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        notes: "Magia",
        tag: "Cita",
      },
    } as unknown as Request;

    const res = createMockResponse();
    updateEvent(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.jsonPayload).toEqual({ message: "No encontramos ese recuerdo" });
  });

  it("deleteEvent devuelve 404 si el repositorio no encuentra el recurso", () => {
    vi.mocked(EventRepository.find).mockReturnValue(undefined);
    const req = { params: { id: "missing" } } as unknown as Request;
    const res = createMockResponse();

    deleteEvent(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.jsonPayload).toEqual({ message: "Ese evento ya no existe" });
  });

  it("deleteEvent elimina eventos existentes", () => {
    vi.mocked(EventRepository.find).mockReturnValue({ id: "1" } as any);
    const deleteSpy = vi.mocked(EventRepository.delete).mockReturnValue();
    const req = { params: { id: "1" } } as unknown as Request;
    const res = createMockResponse();

    deleteEvent(req, res);

    expect(deleteSpy).toHaveBeenCalledWith("1");
    expect(res.statusCode).toBe(204);
  });
});
