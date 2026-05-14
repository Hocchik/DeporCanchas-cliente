import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Cancela una reserva en estado `pendiente` (hold abandonado / timer expirado / salida de la página de pago).
 * Solo el dueño puede ejecutarla y solo aplica a reservas pendientes.
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    throw e;
  }

  const { code } = await ctx.params;
  const supabase = createServiceClient();

  const { data: reserva } = await supabase
    .from("reservas")
    .select("id, usuarios_id, estado")
    .eq("code", code)
    .single();

  if (!reserva) return Response.json({ error: "no_encontrada" }, { status: 404 });
  if (reserva.usuarios_id !== user.id) return Response.json({ error: "forbidden" }, { status: 403 });

  // Idempotente: si ya está cancelada/expirada/pagada, devolvemos OK sin error
  if (reserva.estado !== "pendiente") {
    return Response.json({ ok: true, already: reserva.estado });
  }

  const { error } = await supabase
    .from("reservas")
    .update({ estado: "expirada", expires_at: null })
    .eq("id", reserva.id);

  if (error) {
    return Response.json({ error: "update_failed", detail: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
