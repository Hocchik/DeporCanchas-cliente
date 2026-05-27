import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendRecordatorio } from "@/lib/email/sendRecordatorio";
import { formatLimaDate, formatLimaHourRange } from "@/lib/time";
import { limaYMD, addDaysYMD, limaToUtcISO } from "@/lib/lima-time";

export const runtime = "nodejs";
export const maxDuration = 60;

type ReservaRow = {
  id: number;
  fecha_empieza: string;
  fecha_termina: string;
  usuarios: { id: number; email: string; nombre: string };
  canchas_deportivas: { nombre: string; campus: { nombre: string } };
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("forbidden", { status: 403 });
  }

  const supabase = createServiceClient();
  // "Mañana" en día Lima, no UTC: ventana [00:00 mañana Lima, 00:00 pasado Lima).
  const hoyLima = limaYMD();
  const inicioHoy = limaToUtcISO(hoyLima, "00:00:00");
  const mananaInicio = limaToUtcISO(addDaysYMD(hoyLima, 1), "00:00:00");
  const mananaFin = limaToUtcISO(addDaysYMD(hoyLima, 2), "00:00:00");

  const { data, error } = await supabase
    .from("reservas")
    .select(
      `id, fecha_empieza, fecha_termina,
       usuarios (id, email, nombre),
       canchas_deportivas (nombre, campus (nombre))`
    )
    .eq("estado", "pagada")
    .gte("fecha_empieza", mananaInicio)
    .lt("fecha_empieza", mananaFin)
    .returns<ReservaRow[]>();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Dedup en una sola consulta: tipos de recordatorio ya enviados hoy.
  const { data: yaEnviadas } = await supabase
    .from("notificaciones")
    .select("tipo")
    .like("tipo", "recordatorio_24h_reserva_%")
    .gte("creado_en", inicioHoy);
  const tiposEnviados = new Set((yaEnviadas ?? []).map((n) => n.tipo as string));

  let enviados = 0;
  let fallidos = 0;
  for (const r of data ?? []) {
    const u = r.usuarios;
    const c = r.canchas_deportivas;

    const tipo = `recordatorio_24h_reserva_${r.id}`;
    if (tiposEnviados.has(tipo)) continue;

    const start = new Date(r.fecha_empieza);
    const end = new Date(r.fecha_termina);
    try {
      await sendRecordatorio({
        to: u.email,
        cliente: u.nombre,
        campus: c.campus.nombre,
        cancha: c.nombre,
        fecha: formatLimaDate(start),
        hora: formatLimaHourRange(start, end),
      });
      await supabase.from("notificaciones").insert({
        usuarios_id: u.id,
        tipo,
        titulo: "Recordatorio de reserva",
        mensaje: `Tienes una reserva mañana en ${c.campus.nombre}`,
        leido: false,
      });
      enviados++;
    } catch (e) {
      console.error("recordatorio_failed", r.id, e);
      fallidos++;
    }
  }

  return Response.json({ enviados, fallidos, total: data?.length ?? 0 });
}
