import { NextRequest } from "next/server";
import { requireUser, UnauthorizedError, unauthorizedResponse } from "@/lib/auth/requireUser";
import { createServiceClient } from "@/lib/supabase/server";
import { calcularPoliticaReembolso, calcularMontoReembolso } from "@/lib/reembolsos";
import { sendCancelacion } from "@/lib/email/sendCancelacion";
import { formatLimaDate, formatLimaHourRange } from "@/lib/time";

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
  fecha_termina: string;
  pagos: PagoRow[];
  canchas_deportivas: {
    nombre: string;
    campus: { nombre: string };
  };
};

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
    .select(
      `id, usuarios_id, estado, fecha_empieza, fecha_termina,
       pagos (id, monto, metodo_pago, card_brand, card_last4),
       canchas_deportivas (nombre, campus (nombre))`
    )
    .eq("id", reservaId)
    .single<ReservaRow>();

  if (!reserva) return Response.json({ error: "no_encontrada" }, { status: 404 });
  if (reserva.usuarios_id !== user.id) return Response.json({ error: "forbidden" }, { status: 403 });
  if (reserva.estado !== "pagada") {
    return Response.json({ error: "estado_no_cancelable" }, { status: 409 });
  }
  // No se puede cancelar después de la hora de juego
  if (new Date(reserva.fecha_empieza) <= new Date()) {
    return Response.json({ error: "ya_empezo" }, { status: 409 });
  }

  // Calcular política de reembolso server-side
  const policy = calcularPoliticaReembolso(reserva.fecha_empieza);
  const pago = reserva.pagos?.[0] ?? null;
  const monto_pagado = pago?.monto ?? 0;
  const monto_reembolso = calcularMontoReembolso(monto_pagado, policy.porcentaje);

  // Marcar reserva como cancelada (libera el slot vía EXCLUDE constraint)
  const { error: updErr } = await supabase
    .from("reservas")
    .update({ estado: "cancelada" })
    .eq("id", reservaId);
  if (updErr) {
    return Response.json({ error: "update_failed", detail: updErr.message }, { status: 500 });
  }

  // Si aplica reembolso, registrar en tabla `reembolsos` (estado pendiente).
  // El admin (no en este alcance) lo marcará como procesado más tarde.
  let reembolso_creado = false;
  if (policy.porcentaje > 0 && pago && monto_reembolso > 0) {
    const destino_detalle =
      pago.metodo_pago === "tarjeta"
        ? `${pago.card_brand ?? "Tarjeta"} ****${pago.card_last4 ?? "----"}`
        : user.celular ?? null;

    const { error: insErr } = await supabase.from("reembolsos").insert({
      reserva_id: reserva.id,
      pago_id: pago.id,
      monto: monto_reembolso,
      porcentaje: policy.porcentaje,
      metodo_destino: pago.metodo_pago,
      destino_detalle,
      estado: "pendiente",
      simulated: true,
      motivo: "cancelacion_cliente",
    });
    if (insErr) {
      // No revertimos la cancelación: la reserva ya está cancelada (slot liberado).
      // Logueamos para revisar manualmente.
      console.error("reembolso_insert_failed", insErr);
    } else {
      reembolso_creado = true;
    }
  }

  // Email protocolar de cancelación (no bloquea respuesta)
  try {
    const start = new Date(reserva.fecha_empieza);
    const end = new Date(reserva.fecha_termina);
    const cancha = reserva.canchas_deportivas;
    const campus = cancha.campus;
    const reembolso = reembolso_creado && pago
      ? {
          monto: monto_reembolso,
          porcentaje: policy.porcentaje as 50 | 100,
          destino:
            pago.metodo_pago === "tarjeta"
              ? `${pago.card_brand ?? "Tarjeta"} ****${pago.card_last4 ?? "----"}`
              : `Yape al ${user.celular ?? "—"}`,
        }
      : null;

    await sendCancelacion({
      to: user.email,
      cliente: user.nombre,
      campus: campus.nombre,
      cancha: cancha.nombre,
      fecha: formatLimaDate(start),
      hora: formatLimaHourRange(start, end),
      reembolso,
    });
  } catch (e) {
    console.error("email_cancelacion_failed", e);
  }

  return Response.json({
    ok: true,
    porcentaje: policy.porcentaje,
    monto_reembolso,
    reembolso_creado,
  });
}
