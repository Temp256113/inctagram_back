import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionOrderRepository } from '@libs/repositories/repos/subscriptionOrder.repository';
import { PaymentTransactionRepository } from '@libs/repositories/repos/PaymentTransaction.repository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { PaypalAdapter } from 'libs/infrastructure/paypal/paypal-adapter';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';

export class PaypalPaymentWebhookCommand {
  constructor(
    public readonly data: PaymentContentMicroserviceTypes.PaypalPaymentWebhookHandlerDTO,
  ) {}
}

@CommandHandler(PaypalPaymentWebhookCommand)
export class PaypalPaymentWebhookHandler
  implements ICommandHandler<PaypalPaymentWebhookCommand>
{
  constructor(
    private readonly paymentTransactionRepository: PaymentTransactionRepository,
    private readonly subscriptionOrderRepository: SubscriptionOrderRepository,
    private readonly userRepository: UserRepository,
    private readonly paypalAdapter: PaypalAdapter,
  ) {}

  async execute({ data: command }: PaypalPaymentWebhookCommand): Promise<void> {
    const responceData = await this.paypalAdapter.checkPayment(command.id);

    if (responceData) {
      try {
        const subscriptionOrder =
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
          userId: subscriptionOrder.userId,
          accountType: 'Business',
          expireAt: subscriptionOrder.endDateOfSubscription,
        });
      } catch (err) {
        console.log(err);
      }
    }

    return;
  }
}
