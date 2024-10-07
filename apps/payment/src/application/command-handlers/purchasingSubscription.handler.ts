import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';
import { PaymentTransactionRepository } from '@libs/repositories/repos/PaymentTransaction.repository';
import { SubscriptionOrderRepository } from '@libs/repositories/repos/subscriptionOrder.repository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import add from 'date-fns/add';

export class PurchasingSubscriptionCommand {
  constructor(
    public readonly data: PaymentContentMicroserviceTypes.PurchasingSubscriptionDTO,
  ) {}
}

@CommandHandler(PurchasingSubscriptionCommand)
export class PurchasingSubscriptionUseCase
  implements ICommandHandler<PurchasingSubscriptionCommand>
{
  constructor(
    private readonly paymentTransactionRepository: PaymentTransactionRepository,
    private readonly subscriptionOrderRepository: SubscriptionOrderRepository,
    private readonly userRepository: UserRepository,
    private readonly stripeAdapter: StripeAdapter,
  ) {}

  async execute({
    data: command,
  }: PurchasingSubscriptionCommand): Promise<string> {
    let priceCents;
    let seconds;

    if (command.subscriptionType === 'one day') {
      priceCents = 100;
      seconds = 100;
    } else if (command.subscriptionType === 'two days') {
      priceCents = 200;
      seconds = 200;
    } else if (command.subscriptionType === 'three days') {
      priceCents = 300;
      seconds = 300;
    } else if (command.subscriptionType === 'four days') {
      priceCents = 400;
      seconds = 400;
    }

    const endDateOfSubscription = add(new Date(), {
      seconds: seconds,
    });

    const expireAt = add(new Date(), {
      seconds: seconds,
    });

    const subscriptionOrder =
      await this.subscriptionOrderRepository.createSubscriptionOrder({
        productName: 'subscription',
        priceCents: priceCents,
        userId: command.userId,
        subscriptionType: command.subscriptionType,
        endDateOfSubscription: endDateOfSubscription,
        expireAt: expireAt,
      });

    const result = await this.stripeAdapter.createSession({
      autoRenewal: false,
      clientId: subscriptionOrder.userId,
      description: subscriptionOrder.subscriptionType,
      priceCents: subscriptionOrder.priceCents,
      transacrionId: subscriptionOrder.id.toString(),
    });

    const paymentTransaction =
      await this.paymentTransactionRepository.createPaymentTransaction({
        priceCents: priceCents,
        paymentSystem: command.paymentMethod,
        paymentSystemData: result,
        orderId: subscriptionOrder.id,
      });

    console.log(result);

    return result.url;
  }
}
