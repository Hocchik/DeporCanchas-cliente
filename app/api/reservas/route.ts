import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { crearReservaSchema } from "@/lib/validators/reserva";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";
import { calcularPrecioReserva } from "@/lib/reservas/calcularPrecio";

export const runtime = "nodejs";

const HOLD_MINUTES = 10;

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    throw e;
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = crearReservaSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "validation", issues: parsed.error.issues }, { status: 400 });
  }
  const { canchasdep_id, fecha_empieza, fecha_termina } = parsed.data;

  const supabase = createServiceClient();

  // Cleanup lazy de pendientes vencidos
  await supabase
    .from("reservas")
    .update({ estado: "expirada" })
    .eq("estado", "pendiente")
    .lt("expires_at", new Date().toISOString());

  let precio_total: number;
  try {
    precio_total = await calcularPrecioReserva(canchasdep_id, fecha_empieza, fecha_termina);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }

  const code = randomUUID().slice(0, 8).toUpperCase();
  const expires_at = new Date(Date.now() + HOLD_MINUTES * 60 * 1000).toISOString();

  const { data: created, error } = await supabase
    .from("reservas")
    .insert({
      canchasdep_id,
      usuarios_id: user.id,
      fecha_empieza,
      fecha_termina,
      estado: "pendiente",
      precio_total,
      code,
      expires_at,
    })
    .select("id, code, expires_at, precio_total")
    .single();

  if (error) {
    if (error.message.includes("reservas_no_overlap")) {
      return Response.json({ error: "slot_no_disponible" }, { status: 409 });
    }
    return Response.json({ error: "insert_failed", detail: error.message }, { status: 500 });
  }

  return Response.json({ reserva: created }, { status: 201 });
}
