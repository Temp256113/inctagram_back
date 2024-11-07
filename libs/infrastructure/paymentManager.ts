import { Injectable } from '@nestjs/common';
import { StripeAdapter } from './stripe/stripe-adapter';
import { PaymentSystems } from '@prisma/client';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { PaypalAdapter } from './paypal/paypal-adapter';

interface IPaymentAdapter {
  createPayment(data: {
    description: string;
    clientId: number;
    autoRenewal: boolean;
    price: number;
    subscriptionType: PaymentContentMicroserviceTypes.SubscriptionType;
    startTime: Date;
  }): any;
}

@Injectable()
export class PaymentManager {
  adapters: Partial<Record<PaymentSystems, IPaymentAdapter>> = {};
  constructor(paypalAdapter: PaypalAdapter, stripeAdapter: StripeAdapter) {
    this.adapters[PaymentSystems.Paypal] = paypalAdapter;
    this.adapters[PaymentSystems.Stripe] = stripeAdapter;
  }

  async createPayment(data: {
    paymentSystem: PaymentSystems;
    description: string;
    clientId: number;
    autoRenewal: boolean;
    price: number;
    subscriptionType: PaymentContentMicroserviceTypes.SubscriptionType;
    startTime: Date;
  }): Promise<PaymentContentMicroserviceTypes.PaymentCreateResponce> {
    return await this.adapters[data.paymentSystem].createPayment(data);
  }
}
