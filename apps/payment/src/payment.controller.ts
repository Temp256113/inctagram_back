import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import * as Commands from './application/command-handlers/index';
import * as Queries from './application/query-handlers/index';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import * as CommonTypes from '@libs/common-types/common';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';
import { PaymentMicroservicePatterns } from '@libs/microservice-patterns';

@Controller()
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @EventPattern(PaymentMicroservicePatterns.STRIPE_WEBHOOK)
  async stripeWebhook(
    @Payload() payload: PaymentContentMicroserviceTypes.StripeWebhookDTO,
  ): Promise<void> {
    payload.rawBody = Buffer.from(payload.rawBody);

    await this.commandBus.execute(new Commands.StripeWebhookCommand(payload));

    return;
  }

  @MessagePattern(PaymentMicroservicePatterns.PURCHASING_SUBSCRIPTION)
  async purchasingSubscription(
    @Payload()
    payload: PaymentContentMicroserviceTypes.PurchasingSubscriptionDTO,
  ): Promise<PaymentContentGatewayTypes.PurchasingSubscriptionOutputDTO> {
    const url: string = await this.commandBus.execute(
      new Commands.PurchasingSubscriptionCommand(payload),
    );
    return { url: url };
  }

  @MessagePattern(PaymentMicroservicePatterns.GET_MY_SUBSCRIPTION_PAYMENTS)
  async getMySubscriptionPayments(
    @Payload()
    payload: PaymentContentMicroserviceTypes.GetSubscriptionPayments,
  ): Promise<
    CommonTypes.Paginator<PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO>
  > {
    const subscriptionPayments = await this.queryBus.execute(
      new Queries.GetMySubscriptionPaymentsQuery(payload),
    );

    return subscriptionPayments;
  }
}
