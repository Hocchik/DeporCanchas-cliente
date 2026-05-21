import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";
import { calcularPoliticaReembolso, calcularMontoReembolso } from "@/lib/reembolsos";

export const runtime = "nodejs";

type PagoRow = {
  id: number;
  monto: number;
  metodo_pago: "tarjeta" | "yape" | "plin";
  card_brand: string | null;
  card_last4: string | null;
};

type ReservaRow = {
  id: number;
  usuarios_id: number;
  estado: string;
  fecha_empieza: string;
  // PostgREST devuelve objeto (no array) porque pagos.reserva_id es UNIQUE
  pagos: PagoRow | PagoRow[] | null;
};

function firstPago(pagos: PagoRow | PagoRow[] | null): PagoRow | null {
  if (!pagos) return null;
  return Array.isArray(pagos) ? pagos[0] ?? null : pagos;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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
    .select(
      "id, usuarios_id, estado, fecha_empieza, pagos (id, monto, metodo_pago, card_brand, card_last4)"
    )
    .eq("id", reservaId)
    .single<ReservaRow>();

  if (!reserva) return Response.json({ error: "no_encontrada" }, { status: 404 });
  if (reserva.usuarios_id !== user.id) return Response.json({ error: "forbidden" }, { status: 403 });

  const puede_cancelar = reserva.estado === "pagada" && new Date(reserva.fecha_empieza) > new Date();

  const policy = calcularPoliticaReembolso(reserva.fecha_empieza);
  const pago = firstPago(reserva.pagos);
  const monto_pagado = pago?.monto ?? 0;
  const monto_reembolso = calcularMontoReembolso(monto_pagado, policy.porcentaje);

  let metodo_destino: "tarjeta" | "yape" | "plin" | null = null;
  let destino_detalle: string | null = null;
  if (pago) {
    metodo_destino = pago.metodo_pago;
    if (pago.metodo_pago === "tarjeta") {
      destino_detalle = `${pago.card_brand ?? "Tarjeta"} ****${pago.card_last4 ?? "----"}`;
    } else {
      destino_detalle = user.celular ?? null;
    }
  }

  return Response.json({
    puede_cancelar,
    horas_hasta_reserva: Math.round(policy.horas_hasta_reserva * 10) / 10,
    porcentaje: policy.porcentaje,
    monto_pagado,
    monto_reembolso,
    metodo_destino,
    destino_detalle,
  });
}
