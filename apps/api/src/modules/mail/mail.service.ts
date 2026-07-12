import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import type { Env } from "@/config/env.validation";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
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
      text: `Confirma tu cuenta en Nogal visitando el siguiente enlace (expira en 24 horas):\n${verifyUrl}`,
    });
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.send({
      to,
      subject: "Restablece tu contraseña — Nogal",
      text: `Solicitaste restablecer tu contraseña. Este enlace expira en 1 hora:\n${resetUrl}\n\nSi no fuiste tú, ignora este mensaje.`,
    });
  }
}
