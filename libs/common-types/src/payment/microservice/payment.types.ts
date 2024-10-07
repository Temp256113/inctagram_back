import { QueryFilter } from '@libs/common-types/common';
import { PaymentSystems } from '@prisma/client';

export type StripeWebhookDTO = {
  signature: string;
  rawBody: Buffer;
};

export type PurchasingSubscriptionDTO = {
  userId: number;
  subscriptionType: SubscriptionType;
  paymentMethod: PaymentSystems;
  autoRenewal: boolean;
};

export type SubscriptionType =
  | 'one day'
  | 'two days'
  | 'three days'
  | 'four days';

export const subscriptionType = [
  'one day',
  'two days',
  'three days',
  'four days',
];

// export type GetCurrentSubscription = {
//   userId: number;
//   queryParams: QueryFilter;
// };

export type GetSubscriptionPayments = {
  userId: number;
  queryParams: QueryFilter;
};
