import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';
import { PaymentTransactionRepository } from '@libs/repositories/repos/PaymentTransaction.repository';
import { SubscriptionOrderRepository } from '@libs/repositories/repos/subscriptionOrder.repository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import * as dateFns from 'date-fns';
import { PaymentManager } from 'libs/infrastructure/paymentManager';
import { PaypalAdapter } from 'libs/infrastructure/paypal/paypal-adapter';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';

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
    private readonly userQueryRepository: UserQueryRepository,
    private readonly paymentManager: PaymentManager,
    private readonly paypalAdapter: PaypalAdapter,
  ) {}

  async execute({
    data: command,
  }: PurchasingSubscriptionCommand): Promise<string> {
    const user = await this.userQueryRepository.getUserById(command.userId);

    let price;
    const addDate = {
      days: 0,
      weeks: 0,
      months: 0,
    };

    if (command.subscriptionType === 'day') {
      price = 1;
      addDate.days = 1;
    } else if (command.subscriptionType === 'week') {
      price = 7;
      addDate.weeks = 1;
    } else if (command.subscriptionType === 'month') {
      price = 30;
      addDate.months = 1;
    }

    const expireAt = dateFns.add(new Date(), {
      hours: 1,
    });

    // const payment = await this.paymentManager.createPayment({
    //   paymentSystem: command.paymentMethod,
    //   autoRenewal: false,
    //   clientId: command.userId,
    //   description: command.subscriptionType,
    //   priceCents: priceCents,
    // });

    let accountTypeExpireAt;

    if (user.userAccountType.expireAt) {
      if (dateFns.isPast(user.userAccountType.expireAt)) {
        accountTypeExpireAt = new Date();
      } else {
        accountTypeExpireAt = user.userAccountType.expireAt;
      }
    } else {
      accountTypeExpireAt = new Date();
    }

    const startDate = dateFns.add(accountTypeExpireAt, { minutes: 1 });
    const endDateOfSubscription = dateFns.add(accountTypeExpireAt, addDate);

    const payment = await this.paymentManager.createPayment({
      autoRenewal: command.autoRenewal,
      clientId: command.userId,
      description: command.subscriptionType,
      price: price,
      startTime: startDate,
      subscriptionType: command.subscriptionType,
      paymentSystem: command.paymentMethod,
    });

    const subscriptionOrder =
      await this.subscriptionOrderRepository.createSubscriptionOrder({
        transactionId: payment.sessionId,
        productName: 'subscription',
        price: price,
        userId: command.userId,
        subscriptionType: command.subscriptionType,
        endDateOfSubscription: endDateOfSubscription,
        expireAt: expireAt,
      });

    const paymentTransaction =
      await this.paymentTransactionRepository.createPaymentTransaction({
        price: price,
        paymentSystem: command.paymentMethod,
        paymentSystemData: payment.data,
        orderId: subscriptionOrder.id,
      });

    return payment.url;
  }
}
