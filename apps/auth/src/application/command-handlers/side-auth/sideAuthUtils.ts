import { Prisma, Providers } from '@prisma/client';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { NodemailerService } from '../../../utils/nodemailer.service';
import * as crypto from 'node:crypto';
import { JwtTokensService, RefreshTokenCreateType } from '@libs/jwt-token';
import { secondsToMilliseconds } from 'date-fns';
import { ClientProxy } from '@nestjs/microservices';
import { WebhooksMicroservicePatterns } from '@libs/microservice-patterns';

type UserFromDBType = Prisma.UserGetPayload<{
  include: { emailInfo: true; profile: { include: { profileImage: true } } };
}>;

export class SideAuthUtils {
  constructor(
    protected readonly data: {
      userQueryRepository: UserQueryRepository;
      userRepository: UserRepository;
      nodemailerService: NodemailerService;
      jwtTokensService: JwtTokensService;
      webhooksMicroserviceClient: ClientProxy;
    },
  ) {}
  async getOrCreateUser(data: {
    username: string;
    userEmail: string;
    provider: Providers;
  }): Promise<UserFromDBType> {
    const { username, userEmail, provider } = data;

    const foundUserFromDB: UserFromDBType | null =
      await this.data.userQueryRepository.getUserByEmail(userEmail);

    if (foundUserFromDB) {
      return foundUserFromDB;
    }

    const newCreatedUser = await this.data.userRepository.createUser({
      user: {
        email: userEmail,
        username,
      },
      emailInfo: {
        provider,
        emailIsConfirmed: true,
        registrationConfirmCode: null,
        registrationCodeEndDate: null,
      },
    });

    await this.data.nodemailerService.sendRegistrationSuccessfulMessage(
      newCreatedUser.email,
    );

    this.data.webhooksMicroserviceClient.emit(
      WebhooksMicroservicePatterns.REGISTER_USER_EVENT,
      'null',
    );

    return newCreatedUser;
  }

  async createNewSession(data: {
    userId: number;
    username: string;
  }): Promise<string> {
    const { userId, username } = data;

    const newRefreshTokenUuid = crypto.randomUUID();

    const newRefreshToken: RefreshTokenCreateType =
      await this.data.jwtTokensService.createRefreshToken({
        userId,
        username,
        uuid: newRefreshTokenUuid,
      });

    await this.data.userRepository.createSession({
      userId,
      refreshTokenUuid: newRefreshTokenUuid,
      expiresAt: new Date(secondsToMilliseconds(newRefreshToken.payload.exp)),
    });

    return newRefreshToken.token;
  }
}
