import { Prisma, Providers } from '@prisma/client';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { NodemailerService } from '../../../utils/nodemailer.service';
import * as crypto from 'node:crypto';
import { JwtTokensService, RefreshTokenCreateType } from '@libs/jwt-token';
import { secondsToMilliseconds } from 'date-fns';

type UserFromDBType = Prisma.UserGetPayload<{
  include: { userEmailInfo: true };
}>;

export class SideAuthUtils {
  constructor(
    protected readonly data: {
      userQueryRepository: UserQueryRepository;
      userRepository: UserRepository;
      nodemailerService: NodemailerService;
      jwtTokensService: JwtTokensService;
    },
  ) {}
  async getOrCreateUser(data: {
    username: string;
    userEmail: string;
  }): Promise<UserFromDBType> {
    const { username, userEmail } = data;

    const userFromDB: UserFromDBType | null =
      await this.data.userQueryRepository.getUserByEmail(userEmail);

    let user: UserFromDBType;

    if (userFromDB) {
      user = userFromDB;
    } else {
      user = await this.data.userRepository.createUser({
        user: {
          email: userEmail,
          username,
        },
        emailInfo: {
          provider: Providers.Google,
          emailIsConfirmed: true,
          registrationConfirmCode: null,
          registrationCodeEndDate: null,
        },
      });

      await this.data.nodemailerService.sendRegistrationSuccessfulMessage(
        user.email,
      );
    }

    return user;
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
