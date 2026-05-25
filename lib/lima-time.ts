/**
 * Utilidades de fecha/hora ancladas a Lima (UTC-5, sin DST).
 * Mismo contrato que `Admin_DeporCanchas/lib/lima-time.ts`: el cálculo de slots
 * y las ventanas de fecha se hacen en hora de pared Lima, independiente de la
 * zona del navegador o del server. Sin esto, `new Date(iso).getHours()` da la
 * hora local del entorno y corre los slots varias horas.
 */

export const LIMA_OFFSET = "-05:00";

/** 'YYYY-MM-DD' de un instante, en hora Lima. */
export function limaYMD(d: Date | string = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Hora 0-23 de un instante, en hora Lima. */
export function limaHour(d: Date | string): number {
  const date = typeof d === "string" ? new Date(d) : d;
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Lima",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(date)
  );
}

/** Minutos 0-59 de un instante, en hora Lima. */
export function limaMinutes(d: Date | string): number {
  const date = typeof d === "string" ? new Date(d) : d;
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Lima",
      minute: "2-digit",
    }).format(date)
  );
}

/** Minutos desde medianoche (0-1439) de un instante, en hora Lima. */
export function limaMinutesOfDay(d: Date | string): number {
  return limaHour(d) * 60 + limaMinutes(d);
}

/** Suma n días a un 'YYYY-MM-DD' (usa mediodía UTC para evitar bordes de offset). */
export function addDaysYMD(ymd: string, n: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Día de la semana (0=Dom..6=Sáb, igual que Date.getDay) de un 'YYYY-MM-DD'. */
export function dowYMD(ymd: string): number {
  return new Date(`${ymd}T12:00:00Z`).getUTCDay();
}

/** Instante UTC (ISO) a partir de fecha + hora de pared Lima. `hms` = 'HH:MM' o 'HH:MM:SS'. */
export function limaToUtcISO(ymd: string, hms: string): string {
  const parts = hms.split(":");
  const hh = (parts[0] ?? "00").padStart(2, "0");
  const mm = (parts[1] ?? "00").padStart(2, "0");
  const ss = (parts[2] ?? "00").padStart(2, "0");
  return new Date(`${ymd}T${hh}:${mm}:${ss}${LIMA_OFFSET}`).toISOString();
}
