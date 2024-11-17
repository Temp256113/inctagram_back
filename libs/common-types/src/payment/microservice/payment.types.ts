import { QueryFilter } from '@libs/common-types/common';
import { PaymentSystems } from '@prisma/client';

export type StripeWebhookDTO = {
  signature: string;
  rawBody: Buffer;
};

export type PaypalWebhookDTO = {
  eventType: string;
  id: string;
  paymentData: string;
  data: any;
};

export type PaypalSubscriptionWebhookHandlerDTO = {
  id: string;
  paymentDate: string;
  data: any;
};

export type PaypalPaymentWebhookHandlerDTO = {
  id: string;
  data: any;
};

export type PurchasingSubscriptionDTO = {
  userId: number;
  subscriptionType: SubscriptionType;
  paymentMethod: PaymentSystems;
  autoRenewal: boolean;
};

export type SubscriptionType = 'day' | 'week' | 'month';

export const subscriptionType = ['day', 'week', 'month'];

// export type GetCurrentSubscription = {
//   userId: number;
//   queryParams: QueryFilter;
// };

export type GetSubscriptionPayments = {
  userId: number;
  queryParams: QueryFilter;
};
