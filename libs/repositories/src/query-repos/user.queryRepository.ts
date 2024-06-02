import { Injectable } from '@nestjs/common';
import { UserChangePasswordRequestStates } from '@prisma/client';
import { PrismaService } from '@libs/repositories/prisma.service';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { emailInfo: true, profile: true },
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { emailInfo: true },
    });
  }

  async getPasswordRecoveryRequestByCode(data: {
    recoveryCode: string;
    state: UserChangePasswordRequestStates;
    deleted?: boolean;
  }) {
    const { recoveryCode, state, deleted = false } = data;

    return this.prisma.userChangePasswordRequest.findFirst({
      where: {
        passwordRecoveryCode: recoveryCode,
        state,
        deletedAt: deleted ? { not: null } : null,
      },
      include: { user: true },
    });
  }

  async getPasswordRecoveryRequestByUserEmail(data: {
    email: string;
    state: UserChangePasswordRequestStates;
    deleted?: boolean;
  }) {
    const { email, state, deleted } = data;

    return this.prisma.userChangePasswordRequest.findFirst({
      where: {
        state,
        deletedAt: deleted ? { not: null } : null,
        user: { email },
      },
    });
  }

  async getUserByConfirmEmailCode(confirmEmailCode: string) {
    return this.prisma.user.findFirst({
      where: { emailInfo: { emailConfirmCode: confirmEmailCode } },
      include: { emailInfo: true },
    });
  }

  async getUserByEmailOrUsernameWithFullInfo(data: {
    email: string;
    username: string;
  }) {
    const { email, username } = data;

    return this.prisma.user.findFirst({
      where: { OR: [{ email, profile: { username } }] },
      include: { emailInfo: true, changePasswordRequests: true, profile: true },
    });
  }

  async getUsersAmount() {
    return this.prisma.user.count();
  }

  async getUserSession(data: { userId: number; refreshTokenUuid: string }) {
    return this.prisma.userSession.findUnique({
      where: {
        userId_refreshTokenUuid: {
          userId: data.userId,
          refreshTokenUuid: data.refreshTokenUuid,
        },
      },
      include: { user: true },
    });
  }
}
