import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/repositories/prisma.service';
import { SubscriptionType } from '@libs/common-types/payment/microservice';

@Injectable()
export class SubscriptionOrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSubscriptionOrder(data: {
    transactionId: string;
    productName: string;
    price: number;
    userId: number;
    subscriptionType: SubscriptionType;
    endDateOfSubscription: Date;
    expireAt: Date;
  }) {
    return this.prismaService.subscriptionOrder.create({
      data: {
        id: data.transactionId,
        productName: data.productName,
        price: data.price,
        userId: data.userId,
        subscriptionType: data.subscriptionType,
        expireAt: data.expireAt,
        endDateOfSubscription: data.endDateOfSubscription,
      },
    });
  }

  async updateSubscriptionOrder(transactionId: string, dateOfPayments: Date) {
    return this.prismaService.subscriptionOrder.update({
      where: { id: transactionId },
      data: {
        dateOfPayments: dateOfPayments,
        isPaid: true,
      },
    });
  }
}
