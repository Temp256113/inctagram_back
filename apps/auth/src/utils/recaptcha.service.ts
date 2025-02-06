import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import appConfig from '@libs/config/app.config.service';
import { ConfigType } from '@nestjs/config';
import { RpcCustomException } from '@libs/common-exceptions';

type RecaptchaResponseType =
  | {
      success: true;
      challenge_ts: Date | string;
      hostname: string;
    }
  | {
      success: false;
      'error-codes': string[];
    };

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
      throw new RpcCustomException({
        message: 'reCAPTCHA token is missing or invalid',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return data.success;
  }
}
