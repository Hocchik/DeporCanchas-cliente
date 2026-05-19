/**
 * Política de reembolso (cancelación del cliente):
 *   ≥ 96h antes de fecha_empieza (4 días)   → 100%
 *   24h - 96h antes (1 a 4 días)            → 50%
 *   < 24h antes                             → 0% (puede cancelar, sin reembolso)
 */

export type RefundPolicy = {
  porcentaje: 0 | 50 | 100;
  horas_hasta_reserva: number;
};

const HORA_MS = 3600 * 1000;

export function calcularPoliticaReembolso(
  fechaEmpieza: Date | string,
  ahora: Date = new Date()
): RefundPolicy {
  const inicio = typeof fechaEmpieza === "string" ? new Date(fechaEmpieza) : fechaEmpieza;
  const horas = (inicio.getTime() - ahora.getTime()) / HORA_MS;
  let porcentaje: 0 | 50 | 100;
  if (horas >= 96) porcentaje = 100;
  else if (horas >= 24) porcentaje = 50;
  else porcentaje = 0;
  return { porcentaje, horas_hasta_reserva: horas };
}

export function calcularMontoReembolso(montoPagado: number, porcentaje: 0 | 50 | 100): number {
  return Number(((montoPagado * porcentaje) / 100).toFixed(2));
}
