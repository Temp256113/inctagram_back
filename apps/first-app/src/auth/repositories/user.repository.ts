import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import {
  Providers,
  User,
  UserChangePasswordRequest,
  UserEmailInfo,
  UserSession,
} from '@prisma/client';
import { PrismaService } from '@libs/orm-prisma-service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { websocketsMainPageStateEvents } from '../../websocket/main-page/websocketsMainPage.service';

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
          username,
          email,
          password,
          userEmailInfo: {
            create: {
              provider,
              emailIsConfirmed,
              expiresAt: registrationCodeEndDate,
              emailConfirmCode: registrationConfirmCode,
            },
          },
        },
        include: { userEmailInfo: true },
      });

      this.eventEmitter.emit(websocketsMainPageStateEvents.CREATE_USER);

      return newUser;
    } catch (err) {
      throw new BadRequestException({
        message: 'I cant create new user. Check your provided data',
      });
    }
  }

  async updateUserById(
    userId: number,
    data: Partial<Omit<User, 'createdAt' | 'updatedAt' | 'id'>>,
  ) {
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
    data: Partial<
      Omit<
        UserChangePasswordRequest,
        'createdAt' | 'updatedAt' | 'userId' | 'id'
      >
    >,
  ) {
    return this.prisma.userChangePasswordRequest.update({
      where: { id: passwordRecoveryRequestId },
      data,
    });
  }

  async softDeleteChangePasswordRequest(requestId: number): Promise<void> {
    await this.prisma.userChangePasswordRequest.update({
      where: { id: requestId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async changePassword(data: { userId: number; password: string }) {
    return this.prisma.user.update({
      where: { id: data.userId },
      data: { password: data.password },
    });
  }

  async softDeleteChangePasswordRequestAndChangePasswordTransaction(data: {
    changePasswordRequestId: number;
    changePasswordData: { userId: number; password: string };
  }) {
    await this.prisma.$transaction(async (prisma) => {
      await Promise.all([
        this.softDeleteChangePasswordRequest(data.changePasswordRequestId),
        this.changePassword({
          userId: data.changePasswordData.userId,
          password: data.changePasswordData.password,
        }),
      ]);
    });
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
    await this.prisma.userSession.deleteMany({
      where: { userId: data.userId, refreshTokenUuid: data.refreshTokenUuid },
    });
  }

  async deleteAllSessions(userId: number) {
    return this.prisma.userSession.deleteMany({ where: { userId } });
  }

  async deleteUserPasswordAndDeleteAllSessionsTransaction(userId: number) {
    await this.prisma.$transaction(async (prisma) => {
      await Promise.all([
        this.updateUserById(userId, { password: null }),
        this.deleteAllSessions(userId),
      ]);
    });
  }
}
