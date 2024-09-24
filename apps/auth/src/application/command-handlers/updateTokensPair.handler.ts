import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { RefreshTokenPayloadType, JwtTokensService } from '@libs/jwt-token';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { RpcCustomException } from '@libs/common-exceptions';
import * as AuthMicroserviceTypes from '@libs/common-types/auth/microservice';
import { RefreshTokenUserType } from '@libs/common-types/guards/refreshToken.guard.types';

export class UpdateTokensPairCommand {
  constructor(public readonly data: RefreshTokenUserType) {}
}

@CommandHandler(UpdateTokensPairCommand)
export class UpdateTokensPairHandler
  implements
    ICommandHandler<
      UpdateTokensPairCommand,
      AuthMicroserviceTypes.UpdateTokensPairSchema
    >
{
  constructor(
    private readonly tokensService: JwtTokensService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    command: UpdateTokensPairCommand,
  ): Promise<AuthMicroserviceTypes.UpdateTokensPairSchema> {
    const {
      data: { user, refreshTokenUuid: uuid },
    } = command;

    const newTokensPair: { accessToken: string; refreshToken: string } =
      await this.tokensService.createTokensPair({
        userId: user.id,
        username: user.profile.username,
        uuid,
      });

    await this.updateSession({
      newRefreshToken: newTokensPair.refreshToken,
      userId: user.id,
      currentRefreshTokenUuid: uuid,
    });

    return {
      accessToken: newTokensPair.accessToken,
      refreshToken: newTokensPair.refreshToken,
    };
  }

  async updateSession(data: {
    newRefreshToken: string;
    userId: number;
    currentRefreshTokenUuid: string;
  }): Promise<void> {
    const { newRefreshToken, currentRefreshTokenUuid, userId } = data;

    const newRefreshTokenPayload: RefreshTokenPayloadType =
      this.tokensService.getTokenPayload(newRefreshToken);

    const newRefreshTokenExpiresAtDate: Date = new Date(
      newRefreshTokenPayload.exp * 1000,
    );

    const updatedSessionsAmount = await this.userRepository.updateSession({
      userId,
      currentRefreshTokenUuid,
      refreshTokenExpiresAt: newRefreshTokenExpiresAtDate,
    });

    // если не обновилась ни одна сессия значит она не найдена. если не найдена значит рефреш токен не действительный
    if (updatedSessionsAmount.count < 1) {
      throw new RpcCustomException({
        message: `Refresh token is invalid. Not found active session with provided refresh token`,
        status: HttpStatus.UNAUTHORIZED,
      });
    }
  }
}
