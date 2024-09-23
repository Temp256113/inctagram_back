import { IsIn } from 'class-validator';

const paymentMethod = ['PayPal', 'Stripe'];

export class purchasingSubscriptionDTO {
  @IsIn(paymentMethod)
  paymentMethod: string;
}
