import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('mail.host');
    const user = this.config.get<string>('mail.user');
    const password = this.config.get<string>('mail.password');

    if (host && user && password) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('mail.port'),
        secure: this.config.get<boolean>('mail.secure'),
        auth: { user, pass: password },
      });
    } else {
      this.logger.warn(
        'Mail transport is not configured. Emails will be logged to console.',
      );
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const from = this.config.getOrThrow<string>('mail.from');

    if (!this.transporter) {
      this.logger.log(
        `[DEV MAIL] to=${options.to} subject="${options.subject}"\n${options.text ?? options.html}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }

  async sendEmailVerification(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.config.getOrThrow<string>('auth.frontendUrl');
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Verify your email address',
      text: `Hi ${name},\n\nVerify your email using this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
      html: `
        <p>Hi ${name},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
        <p>Or copy this URL: ${verifyUrl}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });
  }

  async sendPasswordReset(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.config.getOrThrow<string>('auth.frontendUrl');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.sendMail({
      to: email,
      subject: 'Reset your password',
      text: `Hi ${name},\n\nReset your password using this link:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
      html: `
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>Or copy this URL: ${resetUrl}</p>
        <p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
      `,
    });
  }
}
