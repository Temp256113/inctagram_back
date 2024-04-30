import { Response } from 'express';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenPayloadType } from '../../types/tokens.models';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../../utils/tokens.service';
import { UserRepository } from '../../repositories/user.repository';

export class UpdateTokensPairCommand {
  constructor(public readonly data: { refreshToken: string; res: Response }) {}
}

@CommandHandler(UpdateTokensPairCommand)
export class UpdateTokensPairHandler
  implements ICommandHandler<UpdateTokensPairCommand, void>
{
  constructor(
    private readonly tokensService: TokensService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateTokensPairCommand): Promise<void> {
    const {
      data: { refreshToken, res },
    } = command;

    const refreshTokenPayload: RefreshTokenPayloadType | null =
      await this.tokensService.verifyRefreshToken(refreshToken);

    if (!refreshTokenPayload) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const newTokensPair = await this.tokensService.createTokensPair({
      userId: refreshTokenPayload.userId,
      uuid: refreshTokenPayload.uuid,
    });

    const newRefreshTokenPayload: RefreshTokenPayloadType =
      this.tokensService.getTokenPayload(newTokensPair.refreshToken);

    const newRefreshTokenExpiresAtDate: Date = new Date(
      newRefreshTokenPayload.exp * 1000,
    );

    const updatedSessionsAmount = await this.userRepository.updateSession({
      userId: newRefreshTokenPayload.userId,
      currentRefreshTokenUuid: refreshTokenPayload.uuid,
      refreshTokenExpiresAt: newRefreshTokenExpiresAtDate,
    });

    // если не обновилась ни одна сессия значит она не найдена. если не найдена значит рефреш токен не действительный
    if (updatedSessionsAmount.count < 1) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    await this.tokensService.setRefreshTokenInCookie({ refreshToken, res });

    const newAccessToken = newTokensPair.accessToken;

    res.status(HttpStatus.CREATED).send({ accessToken: newAccessToken });
  }
}
