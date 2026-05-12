import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse();
    throw e;
  }
  const filter = req.nextUrl.searchParams.get("filter") ?? "proximas";
  const supabase = createServiceClient();

  let q = supabase
    .from("reservas")
    .select(
      `id, code, estado, fecha_empieza, fecha_termina, precio_total, creado_en,
       canchas_deportivas (id, nombre, tipo_deporte, campus (id, nombre, ubicacion)),
       pagos (id, voucher_url, voucher_serie, voucher_correlativo, metodo_pago)`
    )
    .eq("usuarios_id", user.id)
    .order("fecha_empieza", { ascending: false });

  const nowISO = new Date().toISOString();
  if (filter === "proximas") {
    q = q.in("estado", ["pagada", "pendiente"]).gte("fecha_empieza", nowISO);
  } else if (filter === "pasadas") {
    q = q.eq("estado", "pagada").lt("fecha_empieza", nowISO);
  } else if (filter === "canceladas") {
    q = q.in("estado", ["cancelada", "expirada"]);
  }

  const { data, error } = await q;
  if (error) {
    return Response.json({ error: "query_failed", detail: error.message }, { status: 500 });
  }
  return Response.json({ reservas: data ?? [] });
}
