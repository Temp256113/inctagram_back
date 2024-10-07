import { ApiProperty } from '@nestjs/swagger';
import { PaymentSystems } from '@prisma/client';
import { IsBoolean, IsIn } from 'class-validator';
import {
  subscriptionType,
  SubscriptionType,
} from '../microservice/payment.types';

const paymentMethod = ['PayPal', 'Stripe'];

export class PurchasingSubscriptionDTO {
  @ApiProperty({ enum: PaymentSystems, example: 'Stripe' })
  @IsIn(paymentMethod)
  paymentMethod: PaymentSystems;

  @ApiProperty({ enum: subscriptionType, example: 'one day' })
  @IsIn(subscriptionType)
  subscriptionType: SubscriptionType;

  @ApiProperty({ type: Boolean, example: false })
  @IsBoolean()
  autoRenewal: boolean;
}
