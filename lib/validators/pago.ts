import { z } from "zod";

/** Algoritmo de Luhn: valida el dígito de control de una tarjeta (16 dígitos). */
function luhnValido(numero: string): boolean {
  let suma = 0;
  let alternar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let d = numero.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (alternar) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
    alternar = !alternar;
  }
  return suma % 10 === 0;
}

export const pagoTarjetaSchema = z.object({
  reserva_code: z.string().min(1),
  metodo_pago: z.literal("tarjeta"),
  titular_nombre: z.string().trim().min(3).max(100).regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo letras"),
  titular_dni: z.string().regex(/^\d{8}$/),
  titular_direccion: z.string().trim().min(5).max(200),
  titular_fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((d) => {
    const dob = new Date(d);
    const ahora = new Date();
    let edad = ahora.getFullYear() - dob.getFullYear();
    const m = ahora.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && ahora.getDate() < dob.getDate())) edad--;
    return edad >= 18;
  }, "Debe ser mayor de 18"),
  numero: z
    .string()
    .transform((s) => s.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^\d{16}$/).refine(luhnValido, "Número de tarjeta inválido")),
  expiracion: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
  cvv: z.string().regex(/^\d{3}$/),
});

export const pagoYapeSchema = z.object({
  reserva_code: z.string().min(1),
  metodo_pago: z.enum(["yape", "plin"]),
});

export type PagoTarjetaInput = z.infer<typeof pagoTarjetaSchema>;
export type PagoYapeInput = z.infer<typeof pagoYapeSchema>;
