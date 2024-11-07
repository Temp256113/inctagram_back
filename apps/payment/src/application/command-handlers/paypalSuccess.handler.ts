import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { PaypalAdapter } from 'libs/infrastructure/paypal/paypal-adapter';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';

export class PaypalSuccessCommand {
  constructor(
    public readonly data: PaymentContentGatewayTypes.PaypalSuccessQuery,
  ) {}
}

@CommandHandler(PaypalSuccessCommand)
export class PaypalSuccessHandler
  implements ICommandHandler<PaypalSuccessCommand>
{
  constructor(private readonly paypalAdapter: PaypalAdapter) {}

  async execute({ data: command }: PaypalSuccessCommand): Promise<void> {
    this.paypalAdapter.capturePayment(command.token);
    return;
  }
}
