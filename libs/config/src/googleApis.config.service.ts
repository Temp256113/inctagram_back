import { registerAs } from '@nestjs/config';

export default registerAs('googleApis', () => ({
  CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
}));
