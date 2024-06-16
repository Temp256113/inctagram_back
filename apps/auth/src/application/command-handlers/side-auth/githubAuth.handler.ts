import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus, Inject } from '@nestjs/common';
import authConfig from '@libs/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { Prisma, Providers } from '@prisma/client';
import { NodemailerService } from '../../../utils/nodemailer.service';
import axios from 'axios';
import { JwtTokensService } from '@libs/jwt-token';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { SideAuthUtils } from './sideAuthUtils';
import { RpcCustomException } from '@libs/common-exceptions';
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';
import * as AuthMicroserviceTypes from '@libs/common-types/auth/microservice';
import { ClientProxy } from '@nestjs/microservices';

export class GithubAuthCommand {
  constructor(public readonly data: AuthGatewayControllerTypes.SideAuthDTO) {}
}

@CommandHandler(GithubAuthCommand)
export class GithubAuthHandler
  extends SideAuthUtils
  implements
    ICommandHandler<
      GithubAuthCommand,
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
      jwtTokensService,
      nodemailerService,
      webhooksMicroserviceClient,
    });
  }

  async execute(
    command: GithubAuthCommand,
  ): Promise<AuthMicroserviceTypes.SideAuthResponseDTO> {
    const {
      data: { code: githubCode },
    } = command;

    const userInfoFromGithub: {
      username: string;
      userEmail: string;
    } = await this.getUserInfoFromGithub(githubCode);

    const user = await this.getOrCreateUser({
      username: userInfoFromGithub.username,
      userEmail: userInfoFromGithub.userEmail,
      provider: Providers.Github,
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

  async getUserInfoFromGithub(githubCode: string): Promise<{
    username: string;
    userEmail: string;
  }> {
    const clientId: string = this.config.GITHUB_CLIENT_ID;
    const clientSecret: string = this.config.GITHUB_CLIENT_SECRET;

    const getAccessTokenUrl = new URL(
      'https://github.com/login/oauth/access_token',
    );
    getAccessTokenUrl.searchParams.append('client_id', clientId);
    getAccessTokenUrl.searchParams.append('client_secret', clientSecret);
    getAccessTokenUrl.searchParams.append('code', githubCode);

    const accessToken: {
      access_token: string;
      token_type: string;
      scope: string;
      error?: string;
      error_description?: string;
      error_uri?: string;
    } = await axios({
      method: 'post',
      url: getAccessTokenUrl.href,
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.data)
      .catch((err) => {
        throw new RpcCustomException({
          message: 'Github error response',
          status: HttpStatus.UNAUTHORIZED,
          ...err.response?.data,
        });
      });

    if (accessToken.error) {
      throw new RpcCustomException({
        message: 'Github error response',
        status: HttpStatus.UNAUTHORIZED,
        ...accessToken,
      });
    }

    const userEmails: {
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string;
    }[] = await axios({
      method: 'get',
      url: 'https://api.github.com/user/emails',
      headers: { Authorization: `token ${accessToken.access_token}` },
    })
      .then((response) => response.data)
      .catch((err) => {
        throw new RpcCustomException({
          message: 'Github error response',
          status: HttpStatus.UNAUTHORIZED,
          ...err.response?.data,
        });
      });

    const userInfo = await axios({
      method: 'get',
      url: 'https://api.github.com/user',
      headers: { Authorization: `token ${accessToken.access_token}` },
    })
      .then((response) => response.data)
      .catch((err) => {
        throw new RpcCustomException({
          message: 'Github error response',
          status: HttpStatus.UNAUTHORIZED,
          ...err.response?.data,
        });
      });

    return {
      userEmail: userEmails[0].email,
      username: userInfo.name ?? userInfo.login,
    };
  }
}
