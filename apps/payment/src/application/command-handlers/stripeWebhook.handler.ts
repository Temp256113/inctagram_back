import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';
import Stripe from 'stripe';

export class StripeWebhookCommand {
  constructor(
    public readonly data: PaymentContentMicroserviceTypes.stripeWebhookDTO,
  ) {}
}

@CommandHandler(StripeWebhookCommand)
export class StripeWebhookHandler
  implements ICommandHandler<StripeWebhookCommand>
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly stripeAdapter: StripeAdapter,
  ) {}

  async execute({ data: command }: StripeWebhookCommand): Promise<void> {
    const event = await this.stripeAdapter.createEvent(
      command.rawBody,
      command.signature,
      process.env.STRIPE_ENDPOINT_SECRET,
    );
    console.log(event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(session.client_reference_id);
    }

    return;
  }
}
