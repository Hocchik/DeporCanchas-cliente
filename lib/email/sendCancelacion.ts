import "server-only";
import { getResend, FROM } from "./client";

type Input = {
  to: string;
  cliente: string;
  campus: string;
  cancha: string;
  fecha: string;
  hora: string;
  reembolso: null | {
    monto: number;
    porcentaje: 50 | 100;
    destino: string;
  };
};

export async function sendCancelacion(input: Input) {
  const resend = getResend();
  const reembolsoBlock = input.reembolso
    ? `
      <p style="margin:16px 0 0;">
        <strong>Reembolso aplicable:</strong> S/ ${input.reembolso.monto.toFixed(2)}
        (${input.reembolso.porcentaje}% del total pagado).<br/>
        <strong>Destino:</strong> ${input.reembolso.destino}.
      </p>
      <p style="margin:8px 0 0;">
        Nuestro equipo procesará el reembolso en breve.
        Recibirás otro correo cuando se acredite.
      </p>
    `
    : `
      <p style="margin:16px 0 0;">
        Esta cancelación no genera reembolso según nuestra política
        (cancelaste a menos de 24 horas de la hora de juego).
      </p>
    `;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f2f1f;">
      <h2 style="margin:0 0 16px;">Reserva cancelada</h2>
      <p style="margin:0;">Hola ${input.cliente},</p>
      <p style="margin:8px 0 0;">Confirmamos que cancelaste tu reserva:</p>
      <ul style="margin:12px 0 0;line-height:1.6;">
        <li><strong>Sede:</strong> ${input.campus}</li>
        <li><strong>Cancha:</strong> ${input.cancha}</li>
        <li><strong>Fecha:</strong> ${input.fecha}</li>
        <li><strong>Hora:</strong> ${input.hora}</li>
      </ul>
      ${reembolsoBlock}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:12px;color:#718096;margin:0;">
        Si no fuiste tú quien canceló esta reserva, contáctanos respondiendo a este correo.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: `Reserva cancelada — ${input.campus}`,
    html,
  });
}
