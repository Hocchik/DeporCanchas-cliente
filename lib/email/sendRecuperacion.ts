import "server-only";
import { sendMail } from "./client";

type Input = {
  to: string;
  cliente: string;
  codigo: string; // 6 dígitos
  expiraMin: number;
};

export async function sendRecuperacion(input: Input) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f2f1f;">
      <h2 style="margin:0 0 16px;">Tu código de verificación</h2>
      <p>Hola ${input.cliente},</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Ingresa el siguiente código en la página de DeporCanchas para continuar:</p>
      <div style="margin:28px 0;text-align:center;">
        <div style="display:inline-block;padding:18px 32px;border-radius:12px;background:#F1F8F4;border:1px solid #CCE3D3;">
          <div style="font-size:32px;letter-spacing:10px;font-weight:700;color:#0A3D2E;font-family:'Courier New',Courier,monospace;">
            ${input.codigo}
          </div>
        </div>
      </div>
      <p style="font-size:13px;color:#475569;">
        El código caduca en <strong>${input.expiraMin} minutos</strong>. Por seguridad, no compartas este código con nadie.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:12px;color:#718096;margin:0;">
        Si no solicitaste cambiar tu contraseña, ignora este correo — tu contraseña actual sigue siendo válida.
      </p>
    </div>
  `;
  await sendMail({
    to: input.to,
    subject: `Tu código de verificación: ${input.codigo}`,
    html,
  });
}
