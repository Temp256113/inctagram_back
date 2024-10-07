import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '@libs/repositories/prisma.service';
import { RpcCustomException } from '@libs/common-exceptions';
import { FileResourceTypes, PaymentSystems, Prisma } from '@prisma/client';

@Injectable()
export class PaymentTransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPaymentTransaction(data: {
    priceCents: number;
    paymentSystem: PaymentSystems;
    paymentSystemData: Prisma.JsonObject;
    orderId: number;
  }) {
    return this.prismaService.paymentTransaction.create({
      data: {
        priceCents: data.priceCents,
        paymentSystem: data.paymentSystem,
        paymentSystemData: data.paymentSystemData,
        orderId: data.orderId,
      },
    });
  }

  async updatePaymentTransaction(
    paymentTransactionId: number,
    confirmPaymentSystemData: Prisma.JsonObject,
  ) {
    return this.prismaService.paymentTransaction.update({
      where: { orderId: paymentTransactionId },
      data: {
        confirmPaymentSystemData: confirmPaymentSystemData,
      },
    });
  }
}
