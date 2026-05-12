import "server-only";
import { getResend, FROM } from "./client";

type Input = {
  to: string; cliente: string; campus: string; cancha: string;
  fecha: string; hora: string;
};

export async function sendRecordatorio(input: Input) {
  const resend = getResend();
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f2f1f;">
      <h2>Recordatorio de tu reserva</h2>
      <p>Hola ${input.cliente}, te recordamos que tienes una reserva mañana:</p>
      <ul>
        <li><strong>Sede:</strong> ${input.campus}</li>
        <li><strong>Cancha:</strong> ${input.cancha}</li>
        <li><strong>Fecha:</strong> ${input.fecha}</li>
        <li><strong>Hora:</strong> ${input.hora}</li>
      </ul>
      <p>¡Te esperamos!</p>
    </div>
  `;
  await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: `Recordatorio: tu reserva mañana en ${input.campus}`,
    html,
  });
}
