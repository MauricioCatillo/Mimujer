import { z } from "zod";

export const reminderSchema = z
  .object({
    method: z.enum(["email", "push"]),
    minutesBefore: z.number().int().min(5).max(60 * 24 * 30),
  })
  .optional();

export const eventSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  start: z.string().datetime({ offset: true, message: "La fecha de inicio no es válida" }),
  end: z.string().datetime({ offset: true, message: "La fecha de fin no es válida" }),
  notes: z.string().trim().min(1, "Comparte algunas notas cariñosas"),
  tag: z.string().trim().min(1, "Selecciona una etiqueta"),
  reminder: reminderSchema,
});

export type EventPayload = z.infer<typeof eventSchema>;
