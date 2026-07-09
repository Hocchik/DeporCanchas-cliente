import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Barre reservas 'pendiente' cuyo hold (expires_at) ya venció y las pasa a
 * 'expirada'. Antes de este cron, la única limpieza era "lazy": el POST de
 * /api/reservas expiraba pendientes vencidas solo cuando OTRA persona creaba
 * una reserva nueva. Si nadie volvía a reservar sobre esa cancha, la fila
 * quedaba en 'pendiente' indefinidamente (bloqueando el slot vía el
 * constraint EXCLUDE, y mostrándose como "Pendiente de pago" en el admin en
 * vez de "No completada").
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("forbidden", { status: 403 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("reservas")
    .update({ estado: "expirada" })
    .eq("estado", "pendiente")
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ expiradas: data?.length ?? 0 });
}
