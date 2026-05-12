import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    throw e;
  }
  const { code } = await ctx.params;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("reservas")
    .select(
      `id, code, estado, fecha_empieza, fecha_termina, precio_total, expires_at, usuarios_id,
       canchas_deportivas (
         id, nombre, tipo_deporte,
         campus ( id, nombre, ubicacion )
       )`
    )
    .eq("code", code)
    .single();

  if (error || !data) {
    return Response.json({ error: "no_encontrada" }, { status: 404 });
  }
  if (data.usuarios_id !== user.id) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  return Response.json({ reserva: data });
}
