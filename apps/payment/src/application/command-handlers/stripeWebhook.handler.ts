import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';
import Stripe from 'stripe';
import { SubscriptionOrderRepository } from '@libs/repositories/repos/subscriptionOrder.repository';
import { PaymentTransactionRepository } from '@libs/repositories/repos/PaymentTransaction.repository';
import { UserRepository } from '@libs/repositories/repos/user.repository';

export class StripeWebhookCommand {
  constructor(
    public readonly data: PaymentContentMicroserviceTypes.StripeWebhookDTO,
  ) {}
}

@CommandHandler(StripeWebhookCommand)
export class StripeWebhookHandler
  implements ICommandHandler<StripeWebhookCommand>
{
  constructor(
    private readonly paymentTransactionRepository: PaymentTransactionRepository,
    private readonly subscriptionOrderRepository: SubscriptionOrderRepository,
    private readonly stripeAdapter: StripeAdapter,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ data: command }: StripeWebhookCommand): Promise<void> {
    let event;
    try {
      event = await this.stripeAdapter.createEvent(
        command.rawBody,
        command.signature,
        process.env.STRIPE_ENDPOINT_SECRET,
      );
      console.log(event.type);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(session.client_reference_id);

        const subscriptionOrder =
          await this.subscriptionOrderRepository.updateSubscriptionOrder(
            Number(session.client_reference_id),
          );

        await this.paymentTransactionRepository.updatePaymentTransaction(
          Number(session.client_reference_id),
          event,
        );

        await this.userRepository.updateUserAccountType({
          userId: subscriptionOrder.userId,
          accountType: 'Business',
          expireAt: subscriptionOrder.endDateOfSubscription,
        });
      }
    } catch (err) {
      console.log(err);
    }

    return;
  }
}
