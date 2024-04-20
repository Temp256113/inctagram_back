import { Injectable } from '@nestjs/common';
import { UserChangePasswordRequestStates } from '@prisma/client';
import { PrismaService } from '../../../../../../shared/database/prisma.service';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { userEmailInfo: true },
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { userEmailInfo: true },
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
      where: { userEmailInfo: { emailConfirmCode: confirmEmailCode } },
      include: { userEmailInfo: true },
    });
  }

  async getUserByEmailOrUsernameWithFullInfo(data: {
    email: string;
    username: string;
  }) {
    const { email, username } = data;

    return this.prisma.user.findFirst({
      where: { OR: [{ username, email }] },
      include: { userEmailInfo: true, userChangePasswordRequests: true },
    });
  }

  async getUsersAmount() {
    return this.prisma.user.count();
  }
}
