export type stripeWebhookDTO = {
  signature: string;
  rawBody: Buffer;
};

export type purchasingSubscriptionDTO = {
  paymentMethod: paymentMethod;
};

enum paymentMethod {
  'PayPal',
  'Stripe',
}
