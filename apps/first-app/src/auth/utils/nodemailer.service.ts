import { Inject, Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigType } from '@nestjs/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import appConfig from '@libs/config/app.config.service';

@Injectable()
export class NodemailerService {
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly nodemailerEmailUser: string;
  private readonly frontendUrl: string;

  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {
    this.nodemailerEmailUser = this.config.EMAIL_USER;
    this.frontendUrl = this.config.FRONTEND_URL;

    this.transporter = createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: this.config.EMAIL_USER,
        pass: this.config.EMAIL_PASS,
      },
    });
  }

  async sendRegistrationConfirmMessage(data: {
    email: string;
    confirmCode: string;
  }) {
    const { email, confirmCode } = data;

    try {
      return this.transporter.sendMail({
        from: this.nodemailerEmailUser,
        to: email,
        subject: 'Confirm your registration please',
        html: `To confirm your registration follow link: <a href='${this.frontendUrl}/auth/confirm-registration?code=${confirmCode}'>confirm registration</a>`,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async sendChangePasswordRequestMessage({
    email,
    userPasswordRecoveryCode,
  }: {
    email: string;
    userPasswordRecoveryCode: string;
  }) {
    try {
      return this.transporter.sendMail({
        from: this.nodemailerEmailUser,
        to: email,
        subject: 'Password recovery',
        html: `To reset your password follow link: <a href='${this.frontendUrl}/auth/password-reset?code=${userPasswordRecoveryCode}'>Password recovery</a>`,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async sendRegistrationSuccessfulMessage(email: string) {
    try {
      return this.transporter.sendMail({
        from: this.nodemailerEmailUser,
        to: email,
        subject: 'Successful registration',
        html: `Thank you for registration on inctagram`,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
