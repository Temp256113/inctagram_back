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

  async getProfileByUsername(username: string) {
    return this.prismaService.userProfile.findUnique({
      where: { username },
      include: { profileImage: true },
    });
  }

  async getProfileById(profileId: number) {
    return this.prismaService.userProfile.findUnique({
      where: { userId: profileId },
      include: { profileImage: true },
    });
  }
}
