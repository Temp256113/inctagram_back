import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { UserRepository } from '../../../repositories/user.repository';
import { TokensService } from '../../../utils/tokens.service';
import { Response } from 'express';
import { RefreshTokenPayloadType } from '../../../types/tokens.models';
import { Providers } from '@prisma/client';
import * as crypto from 'crypto';

export type CreateUserType = {
  username: string;
  userEmail: string;
  provider: Providers;
};

export class SideAuthCommonFunctions {
  constructor(
    protected readonly dependencies: {
      userQueryRepository: UserQueryRepository;
      userRepository: UserRepository;
      tokensService: TokensService;
    },
  ) {}

  protected async getUserFromDB(data: Omit<CreateUserType, 'username'>) {
    const { userEmail, provider } = data;

    const user =
      await this.dependencies.userQueryRepository.getUserByEmail(userEmail);

    if (user) {
      if (user.userEmailInfo.provider !== provider) {
        await this.dependencies.userRepository.updateEmailInfoByUserId(
          user.id,
          {
            provider,
            emailIsConfirmed: true,
          },
        );
      }
    }

    return user;
  }

  protected async createUser(data: CreateUserType) {
    const { username, userEmail, provider } = data;

    return this.dependencies.userRepository.createUser({
      user: { email: userEmail, username },
      emailInfo: { provider, emailIsConfirmed: true },
    });
  }

  protected async createUserSession(data: {
    userId: number;
    res: Response;
  }): Promise<void> {
    const { userId, res } = data;

    const refreshToken: string =
      await this.dependencies.tokensService.createRefreshToken({
        userId,
        uuid: crypto.randomUUID(),
      });

    const refreshTokenPayload: RefreshTokenPayloadType =
      this.dependencies.tokensService.getTokenPayload(refreshToken);

    // так как в JWT токене время в секундах, то его надо перевести в миллисекунды
    const refreshTokenExpiresAtDate: Date = new Date(
      refreshTokenPayload.exp * 1000,
    );

    await this.dependencies.userRepository.createSession({
      userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
      expiresAt: refreshTokenExpiresAtDate,
    });

    this.dependencies.tokensService.setRefreshTokenInCookie({
      refreshToken,
      res,
    });
  }

  protected async updateUserSession(data: {
    refreshToken: string;
    res: Response;
  }): Promise<void> {
    const { refreshToken, res } = data;

    const providedRefreshTokenPayload: RefreshTokenPayloadType =
      this.dependencies.tokensService.getTokenPayload(refreshToken);

    const { userId, uuid: currentRefreshTokenUuid } =
      providedRefreshTokenPayload;

    const newRefreshToken: string =
      await this.dependencies.tokensService.createRefreshToken({
        userId,
        uuid: currentRefreshTokenUuid,
      });

    const newRefreshTokenPayload: RefreshTokenPayloadType =
      this.dependencies.tokensService.getTokenPayload(newRefreshToken);

    // так как в JWT токене время в секундах, то его надо перевести в миллисекунды
    const newRefreshTokenExpiresAtDate: Date = new Date(
      newRefreshTokenPayload.exp * 1000,
    );

    await this.dependencies.userRepository.updateSession({
      userId,
      refreshTokenExpiresAt: newRefreshTokenExpiresAtDate,
      currentRefreshTokenUuid,
    });

    this.dependencies.tokensService.setRefreshTokenInCookie({
      refreshToken: newRefreshToken,
      res,
    });
  }
}
