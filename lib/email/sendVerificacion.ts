import "server-only";
import { sendMail } from "./client";

type Input = {
  to: string;
  cliente: string;
  link: string; // URL absoluta con el token
  expiraMin: number;
};

export async function sendVerificacion(input: Input) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f2f1f;">
      <h2 style="margin:0 0 16px;">Confirma tu cuenta</h2>
      <p>Hola ${input.cliente},</p>
      <p>¡Bienvenido a DeporCanchas! Confirma tu correo para poder reservar y pagar canchas:</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${input.link}"
           style="display:inline-block;padding:12px 28px;background:#0A3D2E;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          Verificar mi correo
        </a>
      </p>
      <p style="font-size:13px;color:#475569;">
        Este enlace caduca en <strong>${input.expiraMin} minutos</strong>. Si no funciona, copia y pega esta URL en tu navegador:
      </p>
      <p style="font-size:12px;word-break:break-all;color:#475569;">${input.link}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:12px;color:#718096;margin:0;">
        Si no fuiste tú quien creó esta cuenta, ignora este correo.
      </p>
    </div>
  `;
  await sendMail({
    to: input.to,
    subject: "Verifica tu correo en DeporCanchas",
    html,
  });
}
