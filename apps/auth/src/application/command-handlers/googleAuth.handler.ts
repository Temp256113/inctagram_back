import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SideAuthResponseType } from '../../dto/response/sideAuth.responseType';
import { Inject, UnauthorizedException } from '@nestjs/common';
import authConfig from '@libs/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { NodemailerService } from '../../utils/nodemailer.service';
import { Response as Res } from 'express';
import axios from 'axios';
import { Providers } from '@prisma/client';
import {
  CreateUserType,
  SideAuthCommonFunctions,
} from './common/sideAuth.commonFunctions';
import { RefreshTokenPayloadType, JwtTokensService } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';

export class GoogleAuthCommand {
  constructor(
    public readonly data: {
      googleCode: string;
      res: Res;
      refreshToken: string | undefined;
    },
  ) {}
}

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler
  extends SideAuthCommonFunctions
  implements ICommandHandler<GoogleAuthCommand, SideAuthResponseType>
{
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly tokensService: JwtTokensService,
    private readonly nodemailerService: NodemailerService,
  ) {
    super({
      userQueryRepository,
      userRepository,
      tokensService,
    });
  }

  async execute(command: GoogleAuthCommand): Promise<SideAuthResponseType> {
    const {
      data: { googleCode, res, refreshToken },
    } = command;

    const userInfoFromGoogle = await this.getUserInfoFromGoogle(googleCode);

    const userCreateData: CreateUserType = {
      userEmail: userInfoFromGoogle.userEmail,
      username: userInfoFromGoogle.username,
      provider: Providers.Google,
    };

    const userFromDB = await this.getUserFromDB({
      userEmail: userInfoFromGoogle.userEmail,
      provider: Providers.Google,
    });

    let user;

    if (userFromDB) {
      user = userFromDB;
    } else {
      user = await this.createUser(userCreateData);

      await this.nodemailerService.sendRegistrationSuccessfulMessage(
        user.email,
      );
    }

    const providedRefreshTokenPayload: RefreshTokenPayloadType =
      this.dependencies.tokensService.getTokenPayload(refreshToken);

    // если использует клиент роут для логина через сторонние апи
    // надо проверить есть у него уже рефреш токен или нет
    // если есть то не надо создавать новую сессию чтобы засорять базу
    // надо обновить существующую сессию
    if (providedRefreshTokenPayload) {
      await this.updateUserSession({ refreshToken, res });
    } else {
      await this.createUserSession({ userId: userFromDB.id, res });
    }

    return {
      userId: user.id,
      username: user.username,
      accessToken: await this.tokensService.createAccessToken(user.id),
    };
  }

  async getUserInfoFromGoogle(
    googleCode: string,
  ): Promise<{ username: string; userEmail: string }> {
    const clientId: string = this.config.GOOGLE_CLIENT_ID;
    const clientSecret: string = this.config.GOOGLE_CLIENT_SECRET;
    const frontendUrl: string = this.config.FRONTEND_URL;

    const accessToken: {
      access_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      id_token: string;
    } = await axios({
      method: 'post',
      url: `https://oauth2.googleapis.com/token?grant_type=authorization_code&code=${googleCode}&redirect_uri=${frontendUrl}/auth/sign-in&client_id=${clientId}&client_secret=${clientSecret}`,
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.data)
      .catch((err) => {
        throw new UnauthorizedException({
          message: 'google response',
          ...err.response.data,
        });
      });

    const userInfo: {
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      locale: string;
    } = await axios({
      method: 'get',
      url: `https://www.googleapis.com/userinfo/v2/me`,
      headers: { Authorization: `Bearer ${accessToken.access_token}` },
    })
      .then((res) => res.data)
      .catch((err) => {
        throw new UnauthorizedException(err.response.data);
      });

    return {
      userEmail: userInfo.email,
      username: userInfo.name ?? userInfo.given_name,
    };
  }
}
