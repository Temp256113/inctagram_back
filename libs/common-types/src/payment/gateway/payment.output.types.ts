import { PaymentSystems } from '@prisma/client';
import { SubscriptionType } from '../microservice';

export type PurchasingSubscriptionOutputDTO = {
  url: string;
};

export type SubscriptionPaymentsOutputDTO = {
  dateOfPayments: Date;
  endDateOfSubscription: Date;
  price: number;
  subscriptionType: SubscriptionType;
  paymentType: PaymentSystems;
};

// export type CurrentSubscriptionOutputDTO = {
//   ExpireAt: Date;
//   NextPayment: Date;
// };
