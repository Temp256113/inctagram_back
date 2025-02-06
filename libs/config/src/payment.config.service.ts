import { registerAs } from '@nestjs/config';

export default registerAs('PAYMENT_CONFIG', () => ({
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
}));
