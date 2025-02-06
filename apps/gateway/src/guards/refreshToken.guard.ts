import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokensService, RefreshTokenPayloadType } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { Request } from 'express';
import { RefreshTokenUserType } from '@libs/common-types/guards/refreshToken.guard.types';

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
    const uuid: string = refreshTokenPayload.uuid;

    const findSessionFromDB = this.userQueryRepository.getUserSession({
      userId,
      refreshTokenUuid: uuid,
    });

    const findUserFromDB = this.userQueryRepository.getUserById(userId);

    const [foundSessionFromDB, foundUserFromDB] = await Promise.all([
      findSessionFromDB,
      findUserFromDB,
    ]);

    if (!foundSessionFromDB) {
      throw new UnauthorizedException(
        'Not found user session with provided refresh token',
      );
    }

    if (!foundUserFromDB) {
      throw new UnauthorizedException(
        'Not found user with provided refresh token',
      );
    }

    req.user = {
      user: foundUserFromDB,
      refreshTokenUuid: uuid,
    };

    return true;
  }
}
