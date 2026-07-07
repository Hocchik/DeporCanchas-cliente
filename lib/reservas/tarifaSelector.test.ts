import { describe, it, expect } from "vitest";
import {
  dayInRange,
  timeToMinutes,
  dateInRange,
  hourInRange,
  seleccionarPrecioSlot,
  type TarifaRow,
} from "./tarifaSelector";

describe("dayInRange", () => {
  it("sin días definidos, aplica a todos los días", () => {
    expect(dayInRange(3, null)).toBe(true);
    expect(dayInRange(3, [])).toBe(true);
  });

  it("respeta la lista de días (0=Dom..6=Sáb)", () => {
    expect(dayInRange(5, [5, 6])).toBe(true);
    expect(dayInRange(2, [5, 6])).toBe(false);
  });
});

describe("timeToMinutes", () => {
  it("convierte HH:MM a minutos desde medianoche", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("08:30")).toBe(510);
    expect(timeToMinutes("23:59")).toBe(1439);
  });
});

describe("dateInRange", () => {
  it("sin límites, aplica siempre", () => {
    expect(dateInRange("2026-07-10", null, null)).toBe(true);
  });

  it("respeta el límite inferior", () => {
    expect(dateInRange("2026-07-01", "2026-07-05", null)).toBe(false);
    expect(dateInRange("2026-07-05", "2026-07-05", null)).toBe(true);
  });

  it("respeta el límite superior", () => {
    expect(dateInRange("2026-07-10", null, "2026-07-05")).toBe(false);
    expect(dateInRange("2026-07-05", null, "2026-07-05")).toBe(true);
  });
});

describe("hourInRange", () => {
  it("sin horario definido, aplica siempre", () => {
    expect(hourInRange(600, null, null)).toBe(true);
  });

  it("es un rango [inicio, fin)", () => {
    expect(hourInRange(timeToMinutes("18:00"), "18:00", "22:00")).toBe(true);
    expect(hourInRange(timeToMinutes("21:59"), "18:00", "22:00")).toBe(true);
    expect(hourInRange(timeToMinutes("22:00"), "18:00", "22:00")).toBe(false); // exclusivo
    expect(hourInRange(timeToMinutes("17:59"), "18:00", "22:00")).toBe(false);
  });
});

describe("seleccionarPrecioSlot", () => {
  const tarifaNocturna: TarifaRow = {
    precio: 250,
    prioridad: 1,
    dias: null,
    hora_empieza: "18:00",
    hora_termina: "22:00",
    fecha_empieza: null,
    fecha_termina: null,
  };
  const tarifaFinDeSemana: TarifaRow = {
    precio: 300,
    prioridad: 2,
    dias: [0, 6],
    hora_empieza: null,
    hora_termina: null,
    fecha_empieza: null,
    fecha_termina: null,
  };

  it("usa el precio_default si ninguna tarifa aplica", () => {
    const precio = seleccionarPrecioSlot([tarifaNocturna], 2, "2026-07-08", timeToMinutes("10:00"), 200);
    expect(precio).toBe(200);
  });

  it("lanza error si ninguna tarifa aplica y no hay precio_default", () => {
    expect(() =>
      seleccionarPrecioSlot([tarifaNocturna], 2, "2026-07-08", timeToMinutes("10:00"), null)
    ).toThrow("tarifa_no_definida");
  });

  it("aplica la tarifa cuando el slot cae dentro de su rango horario", () => {
    const precio = seleccionarPrecioSlot([tarifaNocturna], 3, "2026-07-08", timeToMinutes("19:00"), 200);
    expect(precio).toBe(250);
  });

  it("entre varias tarifas aplicables, gana la de menor número de prioridad", () => {
    // Miércoles 19:00 -> solo aplica tarifaNocturna (por horario); domingo -> aplica ambas
    const domingoDow = 0;
    const precio = seleccionarPrecioSlot(
      [tarifaNocturna, tarifaFinDeSemana],
      domingoDow,
      "2026-07-12",
      timeToMinutes("19:00"),
      200
    );
    // tarifaNocturna (prioridad 1) aplica por horario Y tarifaFinDeSemana (prioridad 2) por día;
    // ambas aplican -> gana prioridad 1 (nocturna, 250)
    expect(precio).toBe(250);
  });

  it("respeta la prioridad inversa cuando solo aplica la de menor prioridad numérica", () => {
    const alta: TarifaRow = { ...tarifaFinDeSemana, prioridad: 1, precio: 300 };
    const baja: TarifaRow = { ...tarifaNocturna, dias: null, hora_empieza: null, hora_termina: null, prioridad: 2, precio: 100 };
    const precio = seleccionarPrecioSlot([baja, alta], 0, "2026-07-12", timeToMinutes("10:00"), 200);
    expect(precio).toBe(300);
  });
});
