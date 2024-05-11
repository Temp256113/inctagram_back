import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokensService, RefreshTokenPayloadType } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { Request } from 'express';

export type RefreshTokenUserType = {
  userId: number;
  username: string;
  refreshTokenUuid: string;
};

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly tokensService: JwtTokensService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { user: RefreshTokenUserType } = context
      .switchToHttp()
      .getRequest();

    const refreshToken: string =
      req.cookies?.[JwtTokensService.refreshTokenCookieTitle];

    if (!refreshToken) {
      throw new UnauthorizedException('You need to provide refresh token');
    }

    const refreshTokenPayload: RefreshTokenPayloadType | null =
      await this.tokensService.verifyRefreshToken(refreshToken);

    if (!refreshTokenPayload) {
      throw new UnauthorizedException('Invalid refresh token or expired');
    }

    const userId: number = Number(refreshTokenPayload.userId);

    const foundUserFromDB = await this.userQueryRepository.getUserById(userId);

    if (!foundUserFromDB) {
      throw new UnauthorizedException(
        'Not found user with provided refresh token',
      );
    }

    req.user = {
      userId,
      username: foundUserFromDB.username,
      refreshTokenUuid: refreshTokenPayload.uuid,
    };

    return true;
  }
}
