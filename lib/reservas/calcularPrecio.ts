import "server-only";
import { createServiceClient } from "../supabase/server";

type TarifaRow = {
  precio: number;
  prioridad: number;
  hora_empieza: string | null;
  hora_termina: string | null;
  fecha_empieza: string | null;
  fecha_termina: string | null;
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function dateInRange(dateISO: string, start: string | null, end: string | null): boolean {
  const d = dateISO.slice(0, 10);
  if (start && d < start) return false;
  if (end && d > end) return false;
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
    .select("tipo_deporte")
    .eq("id", canchasdep_id)
    .single();
  if (!cancha) throw new Error("cancha_no_encontrada");

  const { data: tarifaRows } = await supabase
    .from("tarifas_canchasdep")
    .select(
      "precio_reemplazo, tarifas (precio, prioridad, hora_empieza, hora_termina, fecha_empieza, fecha_termina)"
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
    const slotISO = slotDate.toISOString();
    const slotMinutes = slotDate.getHours() * 60 + slotDate.getMinutes();

    const aplicables = candidates
      .filter((t) => dateInRange(slotISO, t.fecha_empieza, t.fecha_termina))
      .filter((t) => hourInRange(slotMinutes, t.hora_empieza, t.hora_termina))
      .sort((a, b) => a.prioridad - b.prioridad);

    if (aplicables.length) {
      total += aplicables[0].precio;
    } else {
      throw new Error("tarifa_no_definida");
    }
  }
  return Number(total.toFixed(2));
}
