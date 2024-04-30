import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/orm-prisma-service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileImageQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findFirst({
    where,
    include,
  }: {
    where: Prisma.ProfileImageWhereInput;
    include?: Prisma.ProfileImageInclude;
  }) {
    return this.prismaService.profileImage.findFirst({
      where,
      include,
    });
  }
}
