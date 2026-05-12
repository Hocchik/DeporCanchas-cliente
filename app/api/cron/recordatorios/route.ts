import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendRecordatorio } from "@/lib/email/sendRecordatorio";

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
  const ahora = new Date();
  const mananaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
  const mananaFin = new Date(mananaInicio);
  mananaFin.setDate(mananaInicio.getDate() + 1);

  const { data, error } = await supabase
    .from("reservas")
    .select(
      `id, fecha_empieza, fecha_termina,
       usuarios (id, email, nombre),
       canchas_deportivas (nombre, campus (nombre))`
    )
    .eq("estado", "pagada")
    .gte("fecha_empieza", mananaInicio.toISOString())
    .lt("fecha_empieza", mananaFin.toISOString())
    .returns<ReservaRow[]>();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let enviados = 0;
  let fallidos = 0;
  for (const r of data ?? []) {
    const u = r.usuarios;
    const c = r.canchas_deportivas;

    // No duplicar si ya se envió hoy
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString();
    const { data: existente } = await supabase
      .from("notificaciones")
      .select("id")
      .eq("usuarios_id", u.id)
      .eq("tipo", `recordatorio_24h_reserva_${r.id}`)
      .gte("creado_en", inicioHoy)
      .maybeSingle();
    if (existente) continue;

    const start = new Date(r.fecha_empieza);
    const end = new Date(r.fecha_termina);
    try {
      await sendRecordatorio({
        to: u.email,
        cliente: u.nombre,
        campus: c.campus.nombre,
        cancha: c.nombre,
        fecha: start.toLocaleDateString("es-PE"),
        hora: `${start.getHours().toString().padStart(2,"0")}:00 - ${end.getHours().toString().padStart(2,"0")}:00`,
      });
      await supabase.from("notificaciones").insert({
        usuarios_id: u.id,
        tipo: `recordatorio_24h_reserva_${r.id}`,
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
