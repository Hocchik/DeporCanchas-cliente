import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { pagoTarjetaSchema, pagoYapeSchema } from "./pago";

const VALID_CARD = "4111111111111111"; // Visa de prueba, dígito de Luhn válido

describe("pagoTarjetaSchema", () => {
  beforeEach(() => {
    // Fija "ahora" para que las validaciones de edad/vencimiento sean deterministas.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const base = {
    reserva_code: "ABC123",
    metodo_pago: "tarjeta" as const,
    titular_nombre: "Joseph Gonzales",
    titular_dni: "12345678",
    titular_direccion: "Av. Siempre Viva 123",
    titular_fecha_nacimiento: "2000-01-01", // 26 años al 2026-07-10
    numero: VALID_CARD,
    expiracion: "12/30",
    cvv: "123",
  };

  it("acepta un pago con tarjeta válido", () => {
    const r = pagoTarjetaSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("acepta el número con espacios y lo limpia", () => {
    const r = pagoTarjetaSchema.safeParse({ ...base, numero: "4111 1111 1111 1111" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.numero).toBe(VALID_CARD);
  });

  it("rechaza número de tarjeta que no pasa Luhn", () => {
    expect(pagoTarjetaSchema.safeParse({ ...base, numero: "4111111111111112" }).success).toBe(false);
  });

  it("rechaza número con longitud distinta a 16", () => {
    expect(pagoTarjetaSchema.safeParse({ ...base, numero: "411111111111" }).success).toBe(false);
  });

  it("rechaza titular menor de 18 años", () => {
    // 2010-01-01 -> 16 años al 2026-07-10
    expect(pagoTarjetaSchema.safeParse({ ...base, titular_fecha_nacimiento: "2010-01-01" }).success).toBe(false);
  });

  it("acepta titular que cumple 18 justo antes de la fecha de corte", () => {
    // Nace 2008-07-09 -> cumple 18 el 2026-07-09, ya pasó respecto al "ahora" fijado (2026-07-10)
    expect(pagoTarjetaSchema.safeParse({ ...base, titular_fecha_nacimiento: "2008-07-09" }).success).toBe(true);
  });

  it("rechaza nombre con números", () => {
    expect(pagoTarjetaSchema.safeParse({ ...base, titular_nombre: "Joseph123" }).success).toBe(false);
  });

  it("rechaza DNI del titular con formato inválido", () => {
    expect(pagoTarjetaSchema.safeParse({ ...base, titular_dni: "123" }).success).toBe(false);
  });

  it("rechaza tarjeta vencida", () => {
    // "ahora" fijado en 2026-07-10; 06/26 venció a fin de junio 2026
    expect(pagoTarjetaSchema.safeParse({ ...base, expiracion: "06/26" }).success).toBe(false);
  });

  it("acepta tarjeta que vence el mismo mes en curso", () => {
    expect(pagoTarjetaSchema.safeParse({ ...base, expiracion: "07/26" }).success).toBe(true);
  });

  it("rechaza formato de expiración inválido", () => {
    expect(pagoTarjetaSchema.safeParse({ ...base, expiracion: "13/26" }).success).toBe(false);
    expect(pagoTarjetaSchema.safeParse({ ...base, expiracion: "2026-07" }).success).toBe(false);
  });

  it("rechaza CVV que no sean 3 dígitos", () => {
    expect(pagoTarjetaSchema.safeParse({ ...base, cvv: "12" }).success).toBe(false);
    expect(pagoTarjetaSchema.safeParse({ ...base, cvv: "12345" }).success).toBe(false);
  });
});

describe("pagoYapeSchema", () => {
  it("acepta yape y plin", () => {
    expect(pagoYapeSchema.safeParse({ reserva_code: "ABC123", metodo_pago: "yape" }).success).toBe(true);
    expect(pagoYapeSchema.safeParse({ reserva_code: "ABC123", metodo_pago: "plin" }).success).toBe(true);
  });

  it("rechaza método de pago distinto de yape/plin", () => {
    expect(pagoYapeSchema.safeParse({ reserva_code: "ABC123", metodo_pago: "tarjeta" }).success).toBe(false);
  });

  it("rechaza reserva_code vacío", () => {
    expect(pagoYapeSchema.safeParse({ reserva_code: "", metodo_pago: "yape" }).success).toBe(false);
  });
});
