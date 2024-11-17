import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import * as dateFns from 'date-fns';
import Stripe from 'stripe';
import { SubscriptionOrderRepository } from '@libs/repositories/repos/subscriptionOrder.repository';
import { PaymentTransactionRepository } from '@libs/repositories/repos/PaymentTransaction.repository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';

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
      event = await this.stripeAdapter.createEvent({
        body: command.rawBody,
        signature: command.signature,
        endpointSecret: process.env.STRIPE_ENDPOINT_SECRET,
      });

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const subscriptionOrder =
          await this.subscriptionOrderRepository.updateSubscriptionOrder(
            session.id,
            new Date(),
          );

        await this.paymentTransactionRepository.updatePaymentTransaction(
          session.id,
          event,
          'Confirmed',
        );

        let autoRenewal = false;
        let nextPayment: Date | null = null;
        if (session.subscription) {
          const subscription = await this.stripeAdapter.checkSubscription(
            session.subscription.toString(),
          );

          nextPayment = dateFns.fromUnixTime(subscription.current_period_end);
          autoRenewal = true;
        }

        await this.userRepository.updateUserAccountType({
          userId: subscriptionOrder.userId,
          accountType: 'Business',
          expireAt: subscriptionOrder.endDateOfSubscription,
          autoRenewal: autoRenewal,
          nextPayment: nextPayment,
        });
      }
    } catch (err) {
      console.log(err);
    }

    return;
  }
}
