import { describe, it, expect } from "vitest";
import { calcularPoliticaReembolso, calcularMontoReembolso } from "./reembolsos";

describe("calcularPoliticaReembolso", () => {
  const ahora = new Date("2026-07-10T00:00:00Z");

  it("da 100% si faltan 96h o más", () => {
    const fecha = new Date("2026-07-14T00:00:00Z"); // +96h exacto
    expect(calcularPoliticaReembolso(fecha, ahora).porcentaje).toBe(100);
  });

  it("da 100% con más de 96h de anticipación", () => {
    const fecha = new Date("2026-07-20T00:00:00Z");
    expect(calcularPoliticaReembolso(fecha, ahora).porcentaje).toBe(100);
  });

  it("da 50% justo en el límite de 24h", () => {
    const fecha = new Date("2026-07-11T00:00:00Z"); // +24h exacto
    expect(calcularPoliticaReembolso(fecha, ahora).porcentaje).toBe(50);
  });

  it("da 50% entre 24h y 96h", () => {
    const fecha = new Date("2026-07-12T12:00:00Z"); // +60h
    expect(calcularPoliticaReembolso(fecha, ahora).porcentaje).toBe(50);
  });

  it("da 0% con menos de 24h de anticipación", () => {
    const fecha = new Date("2026-07-10T23:59:00Z"); // +23h59m
    expect(calcularPoliticaReembolso(fecha, ahora).porcentaje).toBe(0);
  });

  it("da 0% si la reserva ya pasó", () => {
    const fecha = new Date("2026-07-09T00:00:00Z");
    const r = calcularPoliticaReembolso(fecha, ahora);
    expect(r.porcentaje).toBe(0);
    expect(r.horas_hasta_reserva).toBeLessThan(0);
  });

  it("acepta fecha_empieza como string ISO", () => {
    expect(calcularPoliticaReembolso("2026-07-20T00:00:00Z", ahora).porcentaje).toBe(100);
  });
});

describe("calcularMontoReembolso", () => {
  it("calcula 100% del monto pagado", () => {
    expect(calcularMontoReembolso(200, 100)).toBe(200);
  });

  it("calcula 50% del monto pagado", () => {
    expect(calcularMontoReembolso(200, 50)).toBe(100);
  });

  it("calcula 0% del monto pagado", () => {
    expect(calcularMontoReembolso(200, 0)).toBe(0);
  });

  it("redondea a 2 decimales", () => {
    expect(calcularMontoReembolso(99.99, 50)).toBe(49.99);
  });
});
