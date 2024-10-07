/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeAdapter {
  private stripeInstance: Stripe;
  constructor() {
    this.stripeInstance = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: '2024-06-20',
    });
  }
  async createSession(data: {
    transacrionId: string;
    description: string;
    clientId: number;
    autoRenewal: boolean;
    priceCents: number;
  }): Promise<any> {
    const session = await this.stripeInstance.checkout.sessions.create({
      success_url: 'http://localhost:3000/stripe/success',
      cancel_url: 'http://localhost:3000/stripe/cancel',
      line_items: [
        {
          price_data: {
            product_data: {
              name: 'client id: ' + data.clientId,
              description: data.description,
            },
            unit_amount: data.priceCents,
            currency: 'USD',
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: data.transacrionId.toString(),
    });

    return session;
  }

  async createEvent(body, signature, endpointSecret): Promise<any> {
    let event;
    try {
      event = await this.stripeInstance.webhooks.constructEvent(
        body,
        signature,
        endpointSecret,
      );
    } catch (err) {
      console.log(err);
    }
    return event;
  }
}
