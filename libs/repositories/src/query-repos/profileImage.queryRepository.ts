import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@libs/repositories/prisma.service';

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
