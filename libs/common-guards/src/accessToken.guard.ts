import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenPayloadType, JwtTokensService } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { Prisma } from '@prisma/client';

export type AccessTokenUserType = Prisma.UserGetPayload<{
  include: { userEmailInfo: true };
}>;

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokensService: JwtTokensService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { user: AccessTokenUserType } = context
      .switchToHttp()
      .getRequest();

    const accessToken: string = req.headers.authorization;

    if (!accessToken) {
      throw new UnauthorizedException('You need to provide access token');
    }

    const [bearer, accessTokenWithoutBearer] = accessToken.split(' ');

    if (bearer !== 'Bearer') {
      throw new UnauthorizedException(
        'Invalid access token. Not found "Bearer" in authorization headers',
      );
    }

    const accessTokenPayload: AccessTokenPayloadType | null =
      await this.tokensService.verifyAccessToken(accessTokenWithoutBearer);

    if (!accessTokenPayload) {
      throw new UnauthorizedException('Invalid access token or expired');
    }

    const userId: number = Number(accessTokenPayload.userId);

    const foundUserFromDB: Prisma.UserGetPayload<{
      include: { userEmailInfo: true };
    }> = await this.userQueryRepository.getUserById(userId);

    if (!foundUserFromDB) {
      throw new UnauthorizedException(
        'Not found user with provided access token',
      );
    }

    req.user = foundUserFromDB;

    return true;
  }
}
