import "server-only";
import { sendMail } from "./client";

type ConfirmacionInput = {
  to: string;
  cliente: string;
  campus: string;
  cancha: string;
  fecha: string;
  hora: string;
  total: number;
  voucherFilename: string;
  voucherPng: Buffer;
};

export async function sendConfirmacion(input: ConfirmacionInput) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f2f1f;">
      <h2>¡Pago confirmado!</h2>
      <p>Hola ${input.cliente},</p>
      <p>Tu reserva en <strong>${input.campus}</strong> está confirmada.</p>
      <ul>
        <li><strong>Cancha:</strong> ${input.cancha}</li>
        <li><strong>Fecha:</strong> ${input.fecha}</li>
        <li><strong>Hora:</strong> ${input.hora}</li>
        <li><strong>Total pagado:</strong> S/ ${input.total.toFixed(2)}</li>
      </ul>
      <p>Adjuntamos tu voucher. También puedes descargarlo desde "Mis Reservas".</p>
    </div>
  `;
  await sendMail({
    to: input.to,
    subject: `Confirmación de reserva - ${input.campus}`,
    html,
    attachments: [{ filename: input.voucherFilename, content: input.voucherPng }],
  });
}
