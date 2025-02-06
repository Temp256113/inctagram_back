import { PaymentSystems } from '@prisma/client';
import { subscriptionType, SubscriptionType } from '../microservice';
import { ApiProperty } from '@nestjs/swagger';
import * as CommonTypes from '@libs/common-types/common';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';

export type PurchasingSubscriptionOutputDTO = {
  url: string;
};

export class SubscriptionPaymentsOutputDTO {
  @ApiProperty({ type: String, example: '2024-01-01T00:00:00Z' })
  dateOfPayments: Date;

  @ApiProperty({ type: String, example: '2024-01-01T00:00:00Z' })
  endDateOfSubscription: Date;

  @ApiProperty({ type: Number, example: '1' })
  price: number;

  @ApiProperty({ enum: subscriptionType, example: 'day' })
  subscriptionType: SubscriptionType;

  @ApiProperty({ enum: PaymentSystems, example: 'Stripe' })
  paymentType: PaymentSystems;
}

export class PaginatorSubscriptionPaymentsOutputDTO extends CommonTypes.Paginator<PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO> {
  @ApiProperty({
    type: () => [PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO],
  })
  items: PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO[];
}
