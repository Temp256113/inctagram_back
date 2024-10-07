import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/repositories/prisma.service';
import { SubscriptionType } from '@libs/common-types/payment/microservice';

@Injectable()
export class SubscriptionOrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSubscriptionOrder(data: {
    productName: string;
    priceCents: number;
    userId: number;
    subscriptionType: SubscriptionType;
    endDateOfSubscription: Date;
    expireAt: Date;
  }) {
    return this.prismaService.subscriptionOrder.create({
      data: {
        productName: data.productName,
        priceCents: data.priceCents,
        userId: data.userId,
        subscriptionType: data.subscriptionType,
        expireAt: data.expireAt,
        endDateOfSubscription: data.endDateOfSubscription,
      },
    });
  }

  async updateSubscriptionOrder(userId: number) {
    return this.prismaService.subscriptionOrder.update({
      where: { id: userId },
      data: {
        isPaid: true,
      },
    });
  }
}
