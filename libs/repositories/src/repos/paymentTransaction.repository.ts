import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '@libs/repositories/prisma.service';
import { RpcCustomException } from '@libs/common-exceptions';
import {
  FileResourceTypes,
  PaymentStatuses,
  PaymentSystems,
  Prisma,
} from '@prisma/client';

@Injectable()
export class PaymentTransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPaymentTransaction(data: {
    price: number;
    paymentSystem: PaymentSystems;
    paymentSystemData: Prisma.JsonObject;
    orderId: string;
  }) {
    return this.prismaService.paymentTransaction.create({
      data: {
        price: data.price,
        paymentSystem: data.paymentSystem,
        paymentSystemData: data.paymentSystemData,
        orderId: data.orderId,
      },
    });
  }

  async updatePaymentTransaction(
    paymentTransactionId: string,
    confirmPaymentSystemData: Prisma.JsonObject,
    status: PaymentStatuses,
  ) {
    return this.prismaService.paymentTransaction.update({
      where: { orderId: paymentTransactionId },
      data: {
        status: status,
        confirmPaymentSystemData: confirmPaymentSystemData,
      },
    });
  }
}
