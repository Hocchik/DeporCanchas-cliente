import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ReembolsoRow = {
  id: number;
  reserva_id: number;
  monto: number;
  porcentaje: number;
  estado: "pendiente" | "procesado" | "fallido";
  creado_en: string;
  procesado_en: string | null;
};

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

  const { data: reservas, error } = await q;
  if (error) {
    return Response.json({ error: "query_failed", detail: error.message }, { status: 500 });
  }

  // Reembolsos en una segunda query (defensiva — si la tabla aún no existe, devolvemos vacío)
  const reservaIds = (reservas ?? []).map((r) => r.id);
  let reembolsosByReserva: Record<number, ReembolsoRow[]> = {};
  if (reservaIds.length > 0) {
    const { data: reembolsos } = await supabase
      .from("reembolsos")
      .select("id, reserva_id, monto, porcentaje, estado, creado_en, procesado_en")
      .in("reserva_id", reservaIds);
    if (reembolsos) {
      reembolsosByReserva = (reembolsos as ReembolsoRow[]).reduce<Record<number, ReembolsoRow[]>>((acc, r) => {
        (acc[r.reserva_id] ||= []).push(r);
        return acc;
      }, {});
    }
  }

  const out = (reservas ?? []).map((r) => ({
    ...r,
    // PostgREST devuelve pagos como objeto (FK unique) o array; normalizamos a array
    pagos: r.pagos ? (Array.isArray(r.pagos) ? r.pagos : [r.pagos]) : [],
    reembolsos: reembolsosByReserva[r.id] ?? [],
  }));

  return Response.json({ reservas: out });
}
