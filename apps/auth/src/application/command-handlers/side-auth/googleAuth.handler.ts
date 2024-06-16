import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import authConfig from '@libs/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { NodemailerService } from '../../../utils/nodemailer.service';
import axios from 'axios';
import { Prisma, Providers } from '@prisma/client';
import { JwtTokensService } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { RpcCustomException } from '@libs/common-exceptions';
import { SideAuthUtils } from './sideAuthUtils';
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';
import * as AuthMicroserviceTypes from '@libs/common-types/auth/microservice';
import { ClientProxy } from '@nestjs/microservices';

export class GoogleAuthCommand {
  constructor(public readonly data: AuthGatewayControllerTypes.SideAuthDTO) {}
}

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler
  extends SideAuthUtils
  implements
    ICommandHandler<
      GoogleAuthCommand,
      AuthMicroserviceTypes.SideAuthResponseDTO
    >
{
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    protected readonly userQueryRepository: UserQueryRepository,
    protected readonly userRepository: UserRepository,
    protected readonly jwtTokensService: JwtTokensService,
    protected readonly nodemailerService: NodemailerService,
    @Inject('WEBHOOKS_SERVICE')
    protected readonly webhooksMicroserviceClient: ClientProxy,
  ) {
    super({
      userQueryRepository,
      userRepository,
      nodemailerService,
      jwtTokensService,
      webhooksMicroserviceClient,
    });
  }

  async execute(
    command: GoogleAuthCommand,
  ): Promise<AuthMicroserviceTypes.SideAuthResponseDTO> {
    const {
      data: { code: googleCode },
    } = command;

    const userInfoFromGoogle: { username: string; userEmail: string } =
      await this.getUserInfoFromGoogle(googleCode);

    const user: Prisma.UserGetPayload<{
      include: {
        emailInfo: true;
        profile: { include: { profileImage: true } };
      };
    }> = await this.getOrCreateUser({
      username: userInfoFromGoogle.username,
      userEmail: userInfoFromGoogle.userEmail,
      provider: Providers.Google,
    });

    const newRefreshToken: string = await this.createNewSession({
      userId: user.id,
      username: user.profile.username,
    });

    const newAccessToken: string =
      await this.jwtTokensService.createAccessToken({
        userId: user.id,
        username: user.profile.username,
      });

    return {
      userProfile: {
        userId: user.id,
        username: user.profile.username,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        dateOfBirth: user.profile.dateOfBirth,
        country: user.profile.country,
        city: user.profile.city,
        aboutMe: user.profile.aboutMe,
        profileImageURL: user?.profile?.profileImage?.url ?? null,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
        deletedAt: user.profile.deletedAt,
        canModify: true,
      },
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

    const getAccessTokenUrl = new URL('https://oauth2.googleapis.com/token');
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
        throw new RpcCustomException({
          message: 'Google error response',
          status: HttpStatus.UNAUTHORIZED,
          ...err.response?.data,
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
        throw new RpcCustomException({
          message: 'Google error response',
          status: HttpStatus.UNAUTHORIZED,
          ...err.response?.data,
        });
      });

    return {
      userEmail: userInfo.email,
      username: userInfo.name ?? userInfo.given_name,
    };
  }
}
