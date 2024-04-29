import { registerAs } from '@nestjs/config';

export default registerAs('APP_CONFIG', () => ({
  FIRST_APP_PORT: parseInt(process.env.FIRST_APP_PORT) || 3021,
  SECOND_APP_PORT: parseInt(process.env.SECOND_APP_PORT) || 3022,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  YANDEX_ENDPOINT: process.env.YANDEX_ENDPOINT,
  YANDEX_REGION: process.env.YANDEX_REGION,
  YANDEX_ACCESS_KEY_ID: process.env.YANDEX_ACCESS_KEY_ID,
  YANDEX_SECRET_ACCESS_KEY: process.env.YANDEX_SECRET_ACCESS_KEY,
  YANDEX_S3_BUCKET: process.env.YANDEX_S3_BUCKET,
}));
