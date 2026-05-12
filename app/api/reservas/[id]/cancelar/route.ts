import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    throw e;
  }
  const { id } = await ctx.params;
  const reservaId = Number(id);
  if (!Number.isInteger(reservaId)) {
    return Response.json({ error: "id_invalido" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: reserva } = await supabase
    .from("reservas")
    .select("id, usuarios_id, estado, fecha_empieza")
    .eq("id", reservaId)
    .single();

  if (!reserva) return Response.json({ error: "no_encontrada" }, { status: 404 });
  if (reserva.usuarios_id !== user.id) return Response.json({ error: "forbidden" }, { status: 403 });
  if (reserva.estado !== "pagada") {
    return Response.json({ error: "estado_no_cancelable" }, { status: 409 });
  }

  const ventana = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  if (reserva.fecha_empieza < ventana) {
    return Response.json({ error: "fuera_de_ventana" }, { status: 409 });
  }

  const { error } = await supabase
    .from("reservas")
    .update({ estado: "cancelada" })
    .eq("id", reservaId);
  if (error) {
    return Response.json({ error: "update_failed", detail: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
