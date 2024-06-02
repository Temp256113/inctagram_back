import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@libs/repositories/prisma.service';

@Injectable()
export class UserProfileQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfileByUserId(userId: number) {
    return this.prismaService.userProfile.findUnique({
      where: { userId },
      include: { user: true, profileImage: true },
    });
  }
}
