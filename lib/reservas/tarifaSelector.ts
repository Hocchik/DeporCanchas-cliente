/** Lógica pura de selección de tarifa por slot horario. Sin I/O, sin `server-only`:
 * la usan tanto `calcularPrecio.ts` (server) como los tests unitarios. */

export type TarifaRow = {
  precio: number;
  prioridad: number;
  dias: number[] | null;
  hora_empieza: string | null;
  hora_termina: string | null;
  fecha_empieza: string | null;
  fecha_termina: string | null;
};

export function dayInRange(dow: number, dias: number[] | null): boolean {
  if (!dias || dias.length === 0) return true; // sin días = todos los días
  return dias.includes(dow);
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function dateInRange(ymd: string, start: string | null, end: string | null): boolean {
  if (start && ymd < start) return false;
  if (end && ymd > end) return false;
  return true;
}

export function hourInRange(minutes: number, start: string | null, end: string | null): boolean {
  if (!start || !end) return true;
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return minutes >= s && minutes < e;
}

/** Precio de un slot: filtra tarifas aplicables por día/fecha/hora, toma la de mayor
 * prioridad (menor número) y cae a `precioDefault` si ninguna aplica. */
export function seleccionarPrecioSlot(
  candidates: TarifaRow[],
  slotDow: number,
  slotYMD: string,
  slotMinutes: number,
  precioDefault: number | null
): number {
  const aplicables = candidates
    .filter((t) => dayInRange(slotDow, t.dias))
    .filter((t) => dateInRange(slotYMD, t.fecha_empieza, t.fecha_termina))
    .filter((t) => hourInRange(slotMinutes, t.hora_empieza, t.hora_termina))
    .sort((a, b) => a.prioridad - b.prioridad);

  if (aplicables.length) return aplicables[0].precio;
  if (precioDefault !== null) return precioDefault;
  throw new Error("tarifa_no_definida");
}
