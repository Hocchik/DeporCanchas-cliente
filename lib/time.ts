// Server-side time formatters anclados a la zona horaria de Lima.
// El server suele correr en UTC; usar `.getHours()` directo da la hora UTC
// (5h adelantada). Estos helpers garantizan formato en hora local Lima.

const LIMA_TZ = "America/Lima";

export function formatLimaDate(d: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: LIMA_TZ,
  }).format(d);
}

export function formatLimaTime12(d: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: LIMA_TZ,
  }).format(d);
}

/** Devuelve "HH:MM" 24h en hora Lima. */
export function formatLimaTime24(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: LIMA_TZ,
  }).format(d);
}

/** Devuelve "HH:MM - HH:MM" en hora Lima. */
export function formatLimaHourRange(start: Date, end: Date): string {
  return `${formatLimaTime24(start)} - ${formatLimaTime24(end)}`;
}

/** Calcula horas (entero) entre dos fechas. */
export function diffHours(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 3600000);
}
