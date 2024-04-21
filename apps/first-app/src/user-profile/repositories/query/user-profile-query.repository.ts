import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'shared/database/prisma.service';

@Injectable()
export class UserProfileQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfileByUserId(
    userId: number,
    include?: Prisma.UserProfileInclude,
  ) {
    return this.prismaService.userProfile.findUnique({
      where: { userId },
      include,
    });
  }
}
