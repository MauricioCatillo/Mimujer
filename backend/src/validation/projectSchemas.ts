import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio"),
  description: z.string().trim().optional(),
  url: z.string().trim().url("Introduce una URL válida"),
  thumbnailUrl: z.string().trim().url().optional(),
});

export type ProjectPayload = z.infer<typeof projectSchema>;
