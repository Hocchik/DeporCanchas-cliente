import { z } from "zod";

export const crearReservaSchema = z.object({
  canchasdep_id: z.number().int().positive(),
  fecha_empieza: z.string().datetime(),
  fecha_termina: z.string().datetime(),
});

export type CrearReservaInput = z.infer<typeof crearReservaSchema>;
