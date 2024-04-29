import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { RecaptchaResponseType } from '../types/recapcha.types';
import appConfig from '@app/config/app.config.service';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class RecaptchaService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
  ) {}

  async validateToken(token: string) {
    const { data } = await axios.post<RecaptchaResponseType>(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        response: token,
        secret: this.config.RECAPTCHA_SECRET_KEY,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (!data.success) {
      throw new BadRequestException('reCAPTCHA token is missing or invalid');
    }

    return data.success;
  }
}
