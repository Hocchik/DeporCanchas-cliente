import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Inserta una notificación destinada al panel admin en la tabla `notificaciones`.
 * Convención de `tipo`: prefijo `admin_<evento>_<reservaId>` para que el admin
 * la filtre con `tipo LIKE 'admin_%'`. `usuarios_id` apunta al cliente que
 * generó el evento, así el admin puede joinear o mostrar datos del cliente.
 *
 * Errores de envío no deben tumbar el flujo principal (pago/cancelación):
 * la routes que llaman a esta función deben envolver en try/catch.
 */

type Event = "reserva_pagada" | "reserva_cancelada";

export type NotifyAdminInput = {
  event: Event;
  cliente_id: number;
  cliente_nombre: string;
  cliente_email: string;
  reserva_id: number;
  cancha_nombre: string;
  campus_nombre: string;
  fecha_hora: string; // texto ya formateado para mostrar
  monto?: number;     // total pagado (reserva_pagada)
  reembolso?: number; // monto del reembolso (si aplica)
};

const TITULOS: Record<Event, string> = {
  reserva_pagada: "Nueva reserva pagada",
  reserva_cancelada: "Reserva cancelada por cliente",
};

export async function notifyAdmin(input: NotifyAdminInput): Promise<void> {
  const supabase = createServiceClient();
  const mensaje =
    input.event === "reserva_pagada"
      ? `${input.cliente_nombre} (${input.cliente_email}) pagó ${input.cancha_nombre} en ${input.campus_nombre} para el ${input.fecha_hora}. Total: S/ ${input.monto?.toFixed(2) ?? "-"}.`
      : `${input.cliente_nombre} (${input.cliente_email}) canceló su reserva de ${input.cancha_nombre} en ${input.campus_nombre} (${input.fecha_hora}).${
          input.reembolso ? ` Reembolso aplicable: S/ ${input.reembolso.toFixed(2)}.` : ""
        }`;

  await supabase.from("notificaciones").insert({
    usuarios_id: input.cliente_id,
    tipo: `admin_${input.event}_${input.reserva_id}`,
    titulo: TITULOS[input.event],
    mensaje,
    leido: false,
  });
}
