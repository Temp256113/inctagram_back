import { HttpStatus, Injectable } from '@nestjs/common';
import {
  Providers,
  UserChangePasswordRequest,
  UserChangePasswordRequestStates,
  UserEmailInfo,
  UserSession,
} from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { websocketsMainPageStateEvents } from '../../../../apps/first-app/src/websocket/main-page/websocketsMainPage.service';
import {
  PrismaClientTransactionType,
  PrismaService,
} from '@libs/repositories/prisma.service';
import { CustomRpcException } from '@libs/common-exceptions';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createUser(userCreateDTO: {
    user: {
      username: string;
      email: string;
      password?: string;
    };
    emailInfo: {
      provider?: Providers;
      registrationCodeEndDate?: Date;
      registrationConfirmCode?: string;
      emailIsConfirmed: boolean;
    };
  }) {
    const { username, email, password = null } = userCreateDTO.user;

    const {
      provider = null,
      registrationCodeEndDate = null,
      registrationConfirmCode = null,
      emailIsConfirmed,
    } = userCreateDTO.emailInfo;

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email,
          password,
          emailInfo: {
            create: {
              provider,
              emailIsConfirmed,
              expiresAt: registrationCodeEndDate,
              emailConfirmCode: registrationConfirmCode,
            },
          },
          profile: {
            create: {
              username,
            },
          },
        },
        include: {
          emailInfo: true,
          profile: { include: { profileImage: true } },
        },
      });

      this.eventEmitter.emit(websocketsMainPageStateEvents.CREATE_USER);

      return newUser;
    } catch (err) {
      throw new CustomRpcException({
        message: 'I cant create new user. Check your provided data',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  async updateUserById(
    userId: number,
    data: Partial<{ email: string; username: string; password: string }>,
    prismaTransactionClient?: PrismaClientTransactionType,
  ) {
    if (prismaTransactionClient) {
      return prismaTransactionClient.user.update({
        where: { id: userId },
        data,
      });
    }

    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async updateEmailInfoByUserId(userId: number, data: Partial<UserEmailInfo>) {
    return this.prisma.userEmailInfo.update({ where: { userId }, data });
  }

  async createUserChangePasswordRequest(data: {
    userId: number;
    passwordRecoveryCode: string;
    expiresAt: Date;
  }): Promise<UserChangePasswordRequest> {
    return this.prisma.userChangePasswordRequest.create({
      data: {
        userId: data.userId,
        passwordRecoveryCode: data.passwordRecoveryCode,
        expiresAt: data.expiresAt,
      },
    });
  }

  async updateUserChangePasswordRequest(
    passwordRecoveryRequestId: number,
    data: Partial<{
      expiresAt: Date;
      passwordRecoveryCode: string;
      state: UserChangePasswordRequestStates;
    }>,
  ) {
    return this.prisma.userChangePasswordRequest.update({
      where: { id: passwordRecoveryRequestId },
      data,
    });
  }

  async softDeleteChangePasswordRequest(
    requestId: number,
    prismaTransactionClient?: PrismaClientTransactionType,
  ) {
    if (prismaTransactionClient) {
      return prismaTransactionClient.userChangePasswordRequest.update({
        where: { id: requestId },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    await this.prisma.userChangePasswordRequest.update({
      where: { id: requestId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async changePassword(
    data: { userId: number; password: string },
    prismaTransactionClient?: PrismaClientTransactionType,
  ) {
    if (prismaTransactionClient) {
      return prismaTransactionClient.user.update({
        where: { id: data.userId },
        data: { password: data.password },
      });
    }

    return this.prisma.user.update({
      where: { id: data.userId },
      data: { password: data.password },
    });
  }

  async softDeleteChangePasswordRequestAndChangePasswordTransaction(data: {
    changePasswordRequestId: number;
    changePasswordData: { userId: number; password: string };
  }) {
    await this.prisma.$transaction(
      async (transactionClient) => {
        return Promise.all([
          this.softDeleteChangePasswordRequest(
            data.changePasswordRequestId,
            transactionClient,
          ),
          this.changePassword(
            {
              userId: data.changePasswordData.userId,
              password: data.changePasswordData.password,
            },
            transactionClient,
          ),
        ]);
      },
      { timeout: 10000 },
    );
  }

  async createSession(data: {
    userId: number;
    refreshTokenUuid: string;
    expiresAt: Date;
  }): Promise<UserSession> {
    return this.prisma.userSession.create({
      data: {
        userId: data.userId,
        refreshTokenUuid: data.refreshTokenUuid,
        expiresAt: data.expiresAt,
      },
    });
  }

  async updateSession(data: {
    userId: number;
    currentRefreshTokenUuid: string;
    refreshTokenExpiresAt: Date;
  }) {
    return this.prisma.userSession.updateMany({
      where: {
        userId: data.userId,
        refreshTokenUuid: data.currentRefreshTokenUuid,
      },
      data: {
        expiresAt: data.refreshTokenExpiresAt,
      },
    });
  }

  async deleteSession(data: {
    userId: number;
    refreshTokenUuid: string;
  }): Promise<void> {
    await this.prisma.userSession.delete({
      where: {
        userId_refreshTokenUuid: {
          userId: data.userId,
          refreshTokenUuid: data.refreshTokenUuid,
        },
      },
    });
  }

  async deleteAllSessions(
    userId: number,
    prismaTransactionClient?: PrismaClientTransactionType,
  ) {
    if (prismaTransactionClient) {
      return prismaTransactionClient.userSession.deleteMany({
        where: { userId },
      });
    }

    return this.prisma.userSession.deleteMany({ where: { userId } });
  }

  async deleteUserPasswordAndDeleteAllSessionsTransaction(userId: number) {
    await this.prisma.$transaction(async (transactionClient) => {
      await Promise.all([
        this.updateUserById(userId, { password: null }, transactionClient),
        this.deleteAllSessions(userId, transactionClient),
      ]);
    });
  }
}
