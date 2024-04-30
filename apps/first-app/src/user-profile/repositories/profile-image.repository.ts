import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/orm-prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileImageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: Prisma.XOR<
      Prisma.ProfileImageCreateInput,
      Prisma.ProfileImageUncheckedCreateInput
    >,
  ) {
    return this.prismaService.profileImage.create({ data });
  }

  async delete(where: Prisma.ProfileImageWhereUniqueInput) {
    return this.prismaService.profileImage.delete({ where });
  }
}
