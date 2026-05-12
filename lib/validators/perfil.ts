import { z } from "zod";

export const updatePerfilSchema = z.object({
  nombre: z.string().trim().min(3).max(100),
  email: z.string().trim().toLowerCase().email(),
  celular: z.string().regex(/^\d{9}$/).optional().or(z.literal("")),
});

export const cambiarClaveSchema = z.object({
  clave_actual: z.string().min(1),
  clave_nueva: z.string().min(8).max(100),
});
