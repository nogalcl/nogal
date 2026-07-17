import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import type { Env } from "@/config/env.validation";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailLayoutOptions {
  preheader: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
  securityNote: string;
}

const PALETTE = {
  carbon: "#1a1815",
  walnut: "#6b4a34",
  beige: "#ede4d3",
  stone: "#8c8578",
  white: "#ffffff",
};

/**
 * Envoltorio HTML compartido por todos los correos transaccionales — mismo
 * masthead, paleta y tono editorial que el resto del sitio (ver
 * DESIGN_PRINCIPLES.md): sin gradientes, sin colores fuera de la paleta,
 * esquinas casi rectas. El `preheader` es el texto oculto que los clientes
 * de correo muestran junto al asunto en la bandeja de entrada.
 */
function renderEmailHtml({
  preheader,
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  securityNote,
}: EmailLayoutOptions): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nogal</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f1e6; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f1e6; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%; background-color:${PALETTE.beige};">
            <tr>
              <td style="padding:32px 40px; border-bottom:1px solid ${PALETTE.stone}44; text-align:center;">
                <span style="font-family:Georgia,'Times New Roman',serif; font-size:20px; letter-spacing:0.12em; color:${PALETTE.carbon};">NOGAL</span>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 40px 8px;">
                <h1 style="margin:0 0 20px; font-family:Georgia,'Times New Roman',serif; font-weight:400; font-size:26px; line-height:1.3; color:${PALETTE.carbon};">
                  ${heading}
                </h1>
                <div style="font-size:15px; line-height:1.65; color:${PALETTE.carbon};">
                  ${bodyHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 4px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color:${PALETTE.walnut}; border-radius:2px;">
                      <a
                        href="${ctaUrl}"
                        style="display:inline-block; padding:14px 32px; font-size:14px; letter-spacing:0.02em; color:${PALETTE.beige}; text-decoration:none;"
                        >${ctaLabel}</a
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 8px;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:${PALETTE.stone};">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                  <a href="${ctaUrl}" style="color:${PALETTE.stone}; word-break:break-all;">${ctaUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 40px;">
                <p style="margin:0; font-size:13px; line-height:1.6; color:${PALETTE.carbon}; border-top:1px solid ${PALETTE.stone}44; padding-top:20px;">
                  ${securityNote}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 32px; border-top:1px solid ${PALETTE.stone}44;">
                <p style="margin:0; font-size:12px; line-height:1.6; color:${PALETTE.stone};">
                  Nogal — Mobiliario de diseño, antigüedades y piezas de colección.<br />
                  Este es un mensaje automático; no respondas a este correo.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Abstracción mínima de envío de correo. Con MAIL_PROVIDER=log (default,
 * dev) escribe a los logs; con MAIL_PROVIDER=resend envía de verdad vía
 * Resend. El resto del código (AuthService, etc.) no conoce la diferencia.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly useResend: boolean;

  constructor(private readonly configService: ConfigService<Env, true>) {
    this.useResend = this.configService.get("MAIL_PROVIDER") === "resend";
    this.from = this.configService.get("MAIL_FROM");
    this.resend = this.useResend
      ? new Resend(this.configService.get("RESEND_API_KEY"))
      : null;
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.useResend || !this.resend) {
      this.logger.log(
        `[mail:dev] Para: ${message.to} — Asunto: ${message.subject}\n${message.text}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      ...(message.html ? { html: message.html } : {}),
    });

    if (error) {
      this.logger.error(`Error enviando correo a ${message.to}: ${error.message}`);
      throw new Error(`No se pudo enviar el correo: ${error.message}`);
    }
  }

  async sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
    await this.send({
      to,
      subject: "Verifica tu correo — Nogal",
      text: `Confirma tu cuenta en Nogal visitando el siguiente enlace (expira en 24 horas):\n${verifyUrl}\n\nSi no creaste una cuenta en Nogal, ignora este mensaje.`,
      html: renderEmailHtml({
        preheader: "Confirma tu correo para activar tu cuenta de Nogal.",
        heading: "Verifica tu correo",
        bodyHtml: `
          <p style="margin:0 0 16px;">Gracias por crear una cuenta en Nogal. Confirma tu dirección de correo para activarla por completo.</p>
          <p style="margin:0;">Este enlace expira en 24 horas.</p>
        `,
        ctaLabel: "Verificar mi correo",
        ctaUrl: verifyUrl,
        securityNote:
          "Si no creaste una cuenta en Nogal, puedes ignorar este mensaje con tranquilidad — no se realizará ninguna acción sobre tu dirección de correo.",
      }),
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.send({
      to,
      subject: "Restablece tu contraseña — Nogal",
      text: `Solicitaste restablecer tu contraseña. Este enlace expira en 1 hora:\n${resetUrl}\n\nSi no fuiste tú, ignora este mensaje.`,
      html: renderEmailHtml({
        preheader: "Restablece la contraseña de tu cuenta de Nogal.",
        heading: "Restablece tu contraseña",
        bodyHtml: `
          <p style="margin:0 0 16px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en Nogal.</p>
          <p style="margin:0;">Este enlace expira en 1 hora.</p>
        `,
        ctaLabel: "Restablecer contraseña",
        ctaUrl: resetUrl,
        securityNote:
          "Si no solicitaste este cambio, ignora este mensaje — tu contraseña actual seguirá funcionando y no se realizará ningún cambio en tu cuenta.",
      }),
    });
  }
}
