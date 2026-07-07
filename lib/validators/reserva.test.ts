import { describe, it, expect } from "vitest";
import { crearReservaSchema } from "./reserva";

describe("crearReservaSchema", () => {
  const base = {
    canchasdep_id: 1,
    fecha_empieza: "2026-07-10T13:00:00.000Z",
    fecha_termina: "2026-07-10T15:00:00.000Z",
  };

  it("acepta datos válidos", () => {
    expect(crearReservaSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza canchasdep_id no entero", () => {
    expect(crearReservaSchema.safeParse({ ...base, canchasdep_id: 1.5 }).success).toBe(false);
  });

  it("rechaza canchasdep_id negativo o cero", () => {
    expect(crearReservaSchema.safeParse({ ...base, canchasdep_id: 0 }).success).toBe(false);
    expect(crearReservaSchema.safeParse({ ...base, canchasdep_id: -1 }).success).toBe(false);
  });

  it("rechaza fechas que no son ISO datetime", () => {
    expect(crearReservaSchema.safeParse({ ...base, fecha_empieza: "2026-07-10" }).success).toBe(false);
  });
});
