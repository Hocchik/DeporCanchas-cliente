import { describe, it, expect } from "vitest";
import {
  limaYMD,
  limaHour,
  limaMinutes,
  limaMinutesOfDay,
  addDaysYMD,
  dowYMD,
  limaToUtcISO,
} from "./lima-time";

describe("limaYMD", () => {
  it("convierte un instante UTC a la fecha de pared en Lima (UTC-5)", () => {
    // 2026-07-10T02:00:00Z = 2026-07-09T21:00:00 hora Lima (día anterior)
    expect(limaYMD("2026-07-10T02:00:00Z")).toBe("2026-07-09");
  });

  it("no cruza de día cuando la hora UTC ya cayó dentro del mismo día Lima", () => {
    // 2026-07-10T12:00:00Z = 2026-07-10T07:00:00 hora Lima
    expect(limaYMD("2026-07-10T12:00:00Z")).toBe("2026-07-10");
  });
});

describe("limaHour / limaMinutes / limaMinutesOfDay", () => {
  it("da la hora de pared Lima (UTC-5, sin DST)", () => {
    expect(limaHour("2026-07-10T15:30:00Z")).toBe(10);
    expect(limaMinutes("2026-07-10T15:30:00Z")).toBe(30);
    expect(limaMinutesOfDay("2026-07-10T15:30:00Z")).toBe(10 * 60 + 30);
  });

  it("maneja el cruce de medianoche Lima", () => {
    // 2026-07-10T05:00:00Z = 2026-07-10T00:00:00 hora Lima
    expect(limaHour("2026-07-10T05:00:00Z")).toBe(0);
  });
});

describe("addDaysYMD", () => {
  it("suma días sin cruzar mes", () => {
    expect(addDaysYMD("2026-07-10", 3)).toBe("2026-07-13");
  });

  it("cruza de mes correctamente", () => {
    expect(addDaysYMD("2026-07-30", 3)).toBe("2026-08-02");
  });

  it("acepta n negativo (resta días)", () => {
    expect(addDaysYMD("2026-07-10", -1)).toBe("2026-07-09");
  });
});

describe("dowYMD", () => {
  it("da el día de la semana 0=Dom..6=Sáb", () => {
    // 2026-07-10 es viernes
    expect(dowYMD("2026-07-10")).toBe(5);
    // 2026-07-12 es domingo
    expect(dowYMD("2026-07-12")).toBe(0);
  });
});

describe("limaToUtcISO", () => {
  it("convierte fecha+hora de pared Lima a instante UTC", () => {
    // 08:00 Lima = 13:00 UTC (UTC-5)
    expect(limaToUtcISO("2026-07-10", "08:00")).toBe("2026-07-10T13:00:00.000Z");
  });

  it("acepta HH:MM:SS", () => {
    expect(limaToUtcISO("2026-07-10", "08:00:30")).toBe("2026-07-10T13:00:30.000Z");
  });
});
