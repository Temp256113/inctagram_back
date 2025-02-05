import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionOrderRepository } from '@libs/repositories/repos/subscriptionOrder.repository';
import { PaymentTransactionRepository } from '@libs/repositories/repos/PaymentTransaction.repository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { PaypalAdapter } from 'libs/infrastructure/paypal/paypal-adapter';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { SubscriptionOrdersQueryRepository } from '@libs/repositories/query-repos/subscriptionOrders.query.repository';

export class PaypalSubscriptionWebhookCommand {
  constructor(
    public readonly data: PaymentContentMicroserviceTypes.PaypalSubscriptionWebhookHandlerDTO,
  ) {}
}

@CommandHandler(PaypalSubscriptionWebhookCommand)
export class PaypalSubscriptionWebhookHandler
  implements ICommandHandler<PaypalSubscriptionWebhookCommand>
{
  constructor(
    private readonly paymentTransactionRepository: PaymentTransactionRepository,
    private readonly subscriptionOrderRepository: SubscriptionOrderRepository,
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly subscriptionOrdersQueryRepository: SubscriptionOrdersQueryRepository,
    private readonly paypalAdapter: PaypalAdapter,
  ) {}

  async execute({
    data: command,
  }: PaypalSubscriptionWebhookCommand): Promise<void> {
    let responceData = { check: false, nextPayment: '' };

    try {
      const subscriptionOrder =
        await this.subscriptionOrdersQueryRepository.getSubscriptionOrderById(
          command.id,
        );

      const user = await this.userQueryRepository.getUserById(
        subscriptionOrder.userId,
      );

      responceData = await this.paypalAdapter.checkSubscriptionPayment(
        command.id,
        command.paymentDate,
        user.userAccountType.nextPayment,
      );
    } catch (err) {
      console.log(err);
    }

    if (responceData.check) {
      try {
        const updatedSubscriptionOrder =
          await this.subscriptionOrderRepository.updateSubscriptionOrder(
            command.id,
            new Date(),
          );

        await this.paymentTransactionRepository.updatePaymentTransaction(
          command.id,
          command.data,
          'Confirmed',
        );

        await this.userRepository.updateUserAccountType({
          userId: updatedSubscriptionOrder.userId,
          accountType: 'Business',
          expireAt: updatedSubscriptionOrder.endDateOfSubscription,
          autoRenewal: true,
          nextPayment: new Date(responceData.nextPayment),
        });
      } catch (err) {
        console.log(err);
      }
    }

    return;
  }
}
