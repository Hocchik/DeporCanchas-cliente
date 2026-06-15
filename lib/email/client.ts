import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Cliente de correo unificado.
 *
 * Producción: SMTP de Gmail con App Password (`MAIL_HOST=smtp.gmail.com`,
 * `MAIL_PORT=587` o `465`). Para Gmail con clave normal el server rechaza —
 * hay que generar una App Password en https://myaccount.google.com/apppasswords.
 *
 * Demo: SMTP de Mailtrap Sandbox (no llega a destinatarios reales).
 *
 * En el primer envío se llama `verify()` para que credenciales mal armadas
 * salten con un error claro en el terminal en vez de fallar silenciosamente.
 */

let _transporter: Transporter | null = null;
let _verified = false;

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
    secure: port === 465, // 465=SSL; 587/2525/25=STARTTLS o plain
    auth: { user, pass },
    // Útil con Gmail puerto 587 (STARTTLS): garantiza upgrade a TLS
    requireTLS: port === 587,
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

  // Verificación de credenciales (una sola vez por proceso). Si falla acá,
  // el mensaje de error de nodemailer ya dice si es auth, conexión, etc.
  if (!_verified) {
    try {
      await transporter.verify();
      _verified = true;
      console.log(
        `[mail] SMTP conectado: ${process.env.MAIL_HOST}:${process.env.MAIL_PORT} (user=${process.env.MAIL_USER})`,
      );
    } catch (e) {
      console.error(
        `[mail] verify() falló — revisa MAIL_HOST/MAIL_PORT/MAIL_USER/MAIL_PASS en .env (Gmail necesita App Password):`,
        e instanceof Error ? e.message : e,
      );
      throw e;
    }
  }

  await transporter.sendMail({
    from: FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments,
  });
}
