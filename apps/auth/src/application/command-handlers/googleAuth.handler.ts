import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import authConfig from '@libs/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { NodemailerService } from '../../utils/nodemailer.service';
import axios from 'axios';
import { Prisma, Providers } from '@prisma/client';
import { JwtTokensService, RefreshTokenCreateType } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { SideAuthResponseServiceDTO } from '@libs/common-types/auth/controller';
import { CustomRpcException } from '@libs/common-exceptions';
import * as crypto from 'node:crypto';
import { secondsToMilliseconds } from 'date-fns';

export class GoogleAuthCommand {
  constructor(
    public readonly data: {
      googleCode: string;
    },
  ) {}
}

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler
  implements ICommandHandler<GoogleAuthCommand, SideAuthResponseServiceDTO>
{
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtTokensService: JwtTokensService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(
    command: GoogleAuthCommand,
  ): Promise<SideAuthResponseServiceDTO> {
    const {
      data: { googleCode },
    } = command;

    const userInfoFromGoogle: { username: string; userEmail: string } =
      await this.getUserInfoFromGoogle(googleCode);

    const user: Prisma.UserGetPayload<{ include: { userEmailInfo: true } }> =
      await this.getOrCreateUser({
        username: userInfoFromGoogle.username,
        userEmail: userInfoFromGoogle.userEmail,
      });

    const newRefreshToken: string = await this.createNewSession({
      userId: user.id,
      username: user.username,
    });

    const newAccessToken: string =
      await this.jwtTokensService.createAccessToken({
        userId: user.id,
        username: user.username,
      });

    return {
      userId: user.id,
      username: user.username,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getUserInfoFromGoogle(
    googleCode: string,
  ): Promise<{ username: string; userEmail: string }> {
    const clientId: string = this.config.GOOGLE_CLIENT_ID;
    const clientSecret: string = this.config.GOOGLE_CLIENT_SECRET;
    const frontendUrl: string = this.config.FRONTEND_URL;

    const getAccessTokenUrl = new URL('https://oauth2.googleapis.com');
    getAccessTokenUrl.pathname = 'token';
    getAccessTokenUrl.searchParams.append('grant_type', 'authorization_code');
    getAccessTokenUrl.searchParams.append('code', googleCode);
    getAccessTokenUrl.searchParams.append(
      'redirect_uri',
      `${frontendUrl}/auth/sign-in`,
    );
    getAccessTokenUrl.searchParams.append('client_id', clientId);
    getAccessTokenUrl.searchParams.append('client_secret', clientSecret);

    const accessToken: {
      access_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      id_token: string;
    } = await axios({
      method: 'post',
      url: getAccessTokenUrl.href,
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.data)
      .catch((err) => {
        throw new CustomRpcException({
          message: 'Google error response',
          status: HttpStatus.UNAUTHORIZED,
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
        throw new CustomRpcException({
          message: 'Google error response',
          status: HttpStatus.UNAUTHORIZED,
          ...err.response.data,
        });
      });

    return {
      userEmail: userInfo.email,
      username: userInfo.name ?? userInfo.given_name,
    };
  }

  async getOrCreateUser(data: {
    username: string;
    userEmail: string;
  }): Promise<Prisma.UserGetPayload<{ include: { userEmailInfo: true } }>> {
    const { username, userEmail } = data;

    const userFromDB: Prisma.UserGetPayload<{
      include: { userEmailInfo: true };
    }> | null = await this.userQueryRepository.getUserByEmail(userEmail);

    let user: Prisma.UserGetPayload<{ include: { userEmailInfo: true } }>;

    if (userFromDB) {
      user = userFromDB;
    } else {
      user = await this.userRepository.createUser({
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

      await this.nodemailerService.sendRegistrationSuccessfulMessage(
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
      await this.jwtTokensService.createRefreshToken({
        userId,
        username,
        uuid: newRefreshTokenUuid,
      });

    await this.userRepository.createSession({
      userId,
      refreshTokenUuid: newRefreshTokenUuid,
      expiresAt: new Date(secondsToMilliseconds(newRefreshToken.payload.exp)),
    });

    return newRefreshToken.token;
  }
}
