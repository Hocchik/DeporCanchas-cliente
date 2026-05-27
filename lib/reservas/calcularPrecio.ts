import "server-only";
import { createServiceClient } from "../supabase/server";
import { limaYMD, limaMinutesOfDay, dowYMD } from "@/lib/lima-time";

type TarifaRow = {
  precio: number;
  prioridad: number;
  dias: number[] | null;
  hora_empieza: string | null;
  hora_termina: string | null;
  fecha_empieza: string | null;
  fecha_termina: string | null;
};

function dayInRange(dow: number, dias: number[] | null): boolean {
  if (!dias || dias.length === 0) return true; // sin días = todos los días
  return dias.includes(dow);
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function dateInRange(ymd: string, start: string | null, end: string | null): boolean {
  if (start && ymd < start) return false;
  if (end && ymd > end) return false;
  return true;
}

function hourInRange(minutes: number, start: string | null, end: string | null): boolean {
  if (!start || !end) return true;
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  return minutes >= s && minutes < e;
}

export async function calcularPrecioReserva(
  canchasdep_id: number,
  fecha_empieza: string,
  fecha_termina: string
): Promise<number> {
  const supabase = createServiceClient();

  const { data: cancha } = await supabase
    .from("canchas_deportivas")
    .select("tipo_deporte, precio_default")
    .eq("id", canchasdep_id)
    .single();
  if (!cancha) throw new Error("cancha_no_encontrada");
  const precioDefault: number | null = (cancha as { precio_default: number | null }).precio_default ?? null;

  const { data: tarifaRows } = await supabase
    .from("tarifas_canchasdep")
    .select(
      "precio_reemplazo, tarifas (precio, prioridad, dias, hora_empieza, hora_termina, fecha_empieza, fecha_termina)"
    )
    .eq("canchasdep_id", canchasdep_id);

  const candidates: TarifaRow[] = [];
  for (const row of tarifaRows ?? []) {
    const tarifas = Array.isArray(row.tarifas) ? row.tarifas : [row.tarifas];
    for (const t of tarifas) {
      if (!t) continue;
      candidates.push({
        ...t,
        precio: row.precio_reemplazo ?? t.precio,
      });
    }
  }

  const start = new Date(fecha_empieza);
  const end = new Date(fecha_termina);
  const horas = Math.round((end.getTime() - start.getTime()) / 3600000);
  if (horas < 1 || horas > 4) throw new Error("rango_horas_invalido");

  let total = 0;
  for (let i = 0; i < horas; i++) {
    const slotDate = new Date(start.getTime() + i * 3600000);
    // Hora de pared Lima (el server corre en UTC): sin esto las tarifas por hora/fecha
    // se evaluarían 5h corridas y matchearían el rango equivocado.
    const slotYMD = limaYMD(slotDate);
    const slotMinutes = limaMinutesOfDay(slotDate);
    const slotDow = dowYMD(slotYMD); // 0=Dom..6=Sáb, en hora Lima

    const aplicables = candidates
      .filter((t) => dayInRange(slotDow, t.dias))
      .filter((t) => dateInRange(slotYMD, t.fecha_empieza, t.fecha_termina))
      .filter((t) => hourInRange(slotMinutes, t.hora_empieza, t.hora_termina))
      .sort((a, b) => a.prioridad - b.prioridad);

    if (aplicables.length) {
      total += aplicables[0].precio;
    } else if (precioDefault !== null) {
      total += precioDefault; // fallback: precio default de la cancha
    } else {
      throw new Error("tarifa_no_definida");
    }
  }
  return Number(total.toFixed(2));
}
