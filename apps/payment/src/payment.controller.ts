import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import * as Commands from './application/command-handlers/index';
import * as Queries from './application/query-handlers/index';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import * as CommonTypes from '@libs/common-types/common';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';
import { PaymentMicroservicePatterns } from '@libs/microservice-patterns';
import { PaypalSuccessQuery } from '@libs/common-types/payment/gateway/payment.query.types';

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

  @EventPattern(PaymentMicroservicePatterns.PAYPAL_WEBHOOK)
  async paypalWebhook(
    @Payload()
    payload: PaymentContentMicroserviceTypes.PaypalWebhookDTO,
  ): Promise<void> {
    if (payload.eventType === 'CHECKOUT.ORDER.APPROVED') {
      await this.commandBus.execute(
        new Commands.PaypalPaymentWebhookCommand({
          id: payload.id,
          data: payload.data,
        }),
      );
    }

    if (payload.eventType === 'PAYMENT.SALE.COMPLETED') {
      await this.commandBus.execute(
        new Commands.PaypalSubscriptionWebhookCommand({
          id: payload.id,
          paymentDate: payload.paymentData,
          data: payload.data,
        }),
      );
    }

    return;
  }

  @EventPattern(PaymentMicroservicePatterns.PAYPAL_SUCCESS)
  async paypalSuccess(
    @Payload() payload: PaymentContentGatewayTypes.PaypalSuccessQuery,
  ): Promise<void> {
    await this.commandBus.execute(new Commands.PaypalSuccessCommand(payload));

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
