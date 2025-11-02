import { z } from "zod";

export const photoSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  description: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    }),
  takenAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    }),
});

export type PhotoPayload = z.infer<typeof photoSchema>;
