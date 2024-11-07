import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import * as CommonTypes from '@libs/common-types/common';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';
import { SubscriptionOrdersQueryRepository } from '@libs/repositories/query-repos/subscriptionOrders.query.repository';
import { PaypalAdapter } from 'libs/infrastructure/paypal/paypal-adapter';

export class GetMySubscriptionPaymentsQuery {
  constructor(
    public readonly data: PaymentContentMicroserviceTypes.GetSubscriptionPayments,
  ) {}
}

@QueryHandler(GetMySubscriptionPaymentsQuery)
export class GetMySubscriptionPaymentsUsecase
  implements
    IQueryHandler<
      GetMySubscriptionPaymentsQuery,
      CommonTypes.Paginator<PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO>
    >
{
  constructor(
    private readonly subscriptionOrdersQueryRepository: SubscriptionOrdersQueryRepository,
    private readonly paypalAdapter: PaypalAdapter,
  ) {}

  async execute({
    data: data,
  }: GetMySubscriptionPaymentsQuery): Promise<
    CommonTypes.Paginator<PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO>
  > {
    const foundSubscriptionPayments =
      await this.subscriptionOrdersQueryRepository.getSubscriptionOrders(data);

    return foundSubscriptionPayments;
  }
}
