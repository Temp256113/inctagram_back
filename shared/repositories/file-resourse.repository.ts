import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@libs/orm-prisma';

@Injectable()
export class FileResourceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: Prisma.XOR<
      Prisma.FileResourceCreateInput,
      Prisma.FileResourceUncheckedCreateInput
    >,
  ) {
    return this.prismaService.fileResource.create({ data });
  }

  async delete<T>(where: Prisma.FileResourceWhereUniqueInput) {
    return this.prismaService.fileResource.delete({ where });
  }
}
