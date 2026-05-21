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
    montoPagado: number;
    porcentaje: 50 | 100;
    destino: string;
  };
};

export async function sendCancelacion(input: Input) {
  const resend = getResend();
  const contexto =
    input.reembolso?.porcentaje === 100
      ? "Cancelaste con <strong>4 días o más</strong> de anticipación, por lo que te corresponde el <strong>reembolso completo (100%)</strong>."
      : input.reembolso?.porcentaje === 50
        ? "Cancelaste entre <strong>1 y 4 días</strong> antes de la hora de juego, por lo que te corresponde un <strong>reembolso parcial (50%)</strong>."
        : "";

  const reembolsoBlock = input.reembolso
    ? `
      <div style="margin:20px 0 0;padding:16px 18px;background:#E2F5E8;border-radius:12px;">
        <p style="margin:0;font-weight:700;font-size:15px;">
          Reembolso del ${input.reembolso.porcentaje}%: S/ ${input.reembolso.monto.toFixed(2)}
        </p>
        <p style="margin:8px 0 0;font-size:14px;">${contexto}</p>
        <p style="margin:8px 0 0;font-size:14px;">
          <strong>Monto pagado:</strong> S/ ${input.reembolso.montoPagado.toFixed(2)}<br/>
          <strong>Destino del reembolso:</strong> ${input.reembolso.destino}
        </p>
        <p style="margin:12px 0 0;font-size:14px;">
          La devolución se realizará dentro de un periodo de
          <strong>5 a 7 días hábiles</strong>. Recibirás un correo de confirmación
          cuando el reembolso se haya acreditado.
        </p>
      </div>
    `
    : `
      <p style="margin:16px 0 0;color:#9B2C2C;">
        Esta cancelación <strong>no genera reembolso</strong> según nuestra política
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
