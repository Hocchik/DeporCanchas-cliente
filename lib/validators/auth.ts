import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().trim().min(3, "Nombre muy corto").max(100),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  dni: z.string().regex(/^\d{8}$/, "DNI debe tener 8 dígitos"),
  celular: z.string().regex(/^\d{9}$/, "Celular debe tener 9 dígitos").optional().or(z.literal("")),
  clave: z.string().min(8, "Clave debe tener al menos 8 caracteres").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),
  clave: z.string().min(1, "Clave requerida"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
