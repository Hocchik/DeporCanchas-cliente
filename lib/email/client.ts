import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Cliente de correo unificado.
 * Modo demo/academia: SMTP a Mailtrap Sandbox (captura todos los correos en un
 * inbox web; no llegan a destinatarios reales). En producción real se podría
 * cambiar al SMTP/API de un proveedor con dominio verificado, sin tocar las
 * funciones sendConfirmacion/sendCancelacion/sendRecordatorio.
 */

let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT ?? 2525);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (!host || !user || !pass) {
    throw new Error("MAIL_HOST / MAIL_USER / MAIL_PASS no están definidos en el .env");
  }
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465=SSL; 587/2525/25=STARTTLS o plain (Mailtrap acepta plain)
    auth: { user, pass },
  });
  return _transporter;
}

export const FROM = process.env.MAIL_FROM ?? "DeporCanchas <no-reply@deporcanchas.demo>";

export type EmailAttachment = { filename: string; content: Buffer | string };

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

/** Envío unificado. Lanza si falla (la ruta caller decide qué hacer con el error). */
export async function sendMail(input: SendMailInput): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments,
  });
}
