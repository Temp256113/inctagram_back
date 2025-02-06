import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/repositories/prisma.service';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';

@Injectable()
export class SubscriptionOrdersQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscriptionOrders(
    data: PaymentContentMicroserviceTypes.GetSubscriptionPayments,
  ) {
    const skip = (data.queryParams.pageNumber - 1) * data.queryParams.pageSize;

    const subscriptionOrders = await this.prisma.subscriptionOrder.findMany({
      where: { userId: data.userId },
      include: {
        PaymentTransaction: true,
      },
      take: data.queryParams.pageSize,
      skip: skip,
      orderBy: { createdAt: data.queryParams.sortDirection },
    });

    const dbCount = subscriptionOrders.length;

    const paginator = {
      pagesCount: Math.ceil(dbCount / data.queryParams.pageSize),
      page: data.queryParams.pageNumber,
      pageSize: data.queryParams.pageSize,
      totalCount: dbCount,
      items: subscriptionOrders.map((order) => subscriptionOrdersmapper(order)),
    };

    return paginator;
  }

  async getSubscriptionOrderById(subscriptionOrderId: string) {
    return this.prisma.subscriptionOrder.findUnique({
      where: { id: subscriptionOrderId },
    });
  }
}

const subscriptionOrdersmapper = (
  subscriptionOrder,
): PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO => {
  return {
    dateOfPayments: subscriptionOrder.dateOfPayments,
    endDateOfSubscription: subscriptionOrder.endDateOfSubscription,
    paymentType: subscriptionOrder.PaymentTransaction.paymentSystem,
    price: subscriptionOrder.priceCents,
    subscriptionType: subscriptionOrder.subscriptionType,
  };
};
