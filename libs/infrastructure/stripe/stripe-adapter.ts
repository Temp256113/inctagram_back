/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';

@Injectable()
export class StripeAdapter {
  private stripeInstance: Stripe;
  constructor() {
    this.stripeInstance = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: '2024-06-20',
    });
  }
  async createPayment(data: {
    description: string;
    clientId: number;
    autoRenewal: boolean;
    price: number;
    subscriptionType: PaymentContentMicroserviceTypes.SubscriptionType;
    startTime: Date;
  }): Promise<PaymentContentMicroserviceTypes.PaymentCreateResponce> {
    if (data.autoRenewal) {
      const session: Stripe.Response<Stripe.Checkout.Session> =
        await this.stripeInstance.checkout.sessions.create({
          mode: 'subscription',
          line_items: [
            {
              price_data: {
                product_data: {
                  name: 'inctagram',
                  description: data.description,
                },
                unit_amount: data.price * 100,
                currency: 'USD',
                recurring: {
                  interval: data.subscriptionType,
                },
              },
              quantity: 1,
            },
          ],
          success_url: process.env.FRONTEND_SUCCESS_PAYMENT_URL,
          cancel_url: process.env.FRONTEND_CANCEL_PAYMENT_URL,
          client_reference_id: data.clientId.toString(),
        });

      return { data: session, sessionId: session.id, url: session.url };
    } else {
      const session: Stripe.Response<Stripe.Checkout.Session> =
        await this.stripeInstance.checkout.sessions.create({
          success_url: process.env.FRONTEND_SUCCESS_PAYMENT_URL,
          cancel_url: process.env.FRONTEND_CANCEL_PAYMENT_URL,
          line_items: [
            {
              price_data: {
                product_data: {
                  name: 'inctagram',
                  description: data.description,
                },
                unit_amount: data.price * 100,
                currency: 'USD',
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          client_reference_id: data.clientId.toString(),
        });

      return { data: session, sessionId: session.id, url: session.url };
    }
  }

  async checkSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    let subscription;

    try {
      subscription =
        await this.stripeInstance.subscriptions.retrieve(subscriptionId);
    } catch (err) {
      console.log('checkSubscription ERR: ');
      console.log(err);
    }

    return subscription;
  }

  async createEvent(data: { body; signature; endpointSecret }): Promise<any> {
    let event;
    try {
      event = await this.stripeInstance.webhooks.constructEvent(
        data.body,
        data.signature,
        data.endpointSecret,
      );
    } catch (err) {
      console.log(err);
    }

    return event;
  }
}
