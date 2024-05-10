import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenPayloadType, JwtTokensService } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokensService: JwtTokensService,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { [prop: string]: any } = context
      .switchToHttp()
      .getRequest();

    const errorDescription = 'Invalid access token';

    const accessToken: string = req.headers.authorization;

    if (!accessToken) {
      throw new UnauthorizedException(errorDescription);
    }

    const [bearer, accessTokenWithoutBearer] = accessToken.split(' ');

    if (bearer !== 'Bearer') {
      throw new UnauthorizedException(errorDescription);
    }

    const accessTokenPayload: AccessTokenPayloadType | null =
      await this.tokensService.verifyAccessToken(accessTokenWithoutBearer);

    if (!accessTokenPayload) {
      throw new UnauthorizedException(errorDescription);
    }

    const foundUserFromDB = await this.userQueryRepository.getUserById(
      +accessTokenPayload.userId,
    );

    if (!foundUserFromDB) {
      throw new UnauthorizedException(errorDescription);
    }

    req.user = { userId: +accessTokenPayload.userId };

    return true;
  }
}
