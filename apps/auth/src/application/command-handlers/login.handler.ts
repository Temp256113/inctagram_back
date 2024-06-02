import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { BcryptService } from '../../utils/bcrypt.service';
import * as crypto from 'crypto';
import { JwtTokensService, RefreshTokenCreateType } from '@libs/jwt-token';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import * as AuthControllerTypes from '@libs/common-types/auth/controller';
import { CustomRpcException } from '@libs/common-exceptions';

export class LoginCommand {
  constructor(public readonly data: AuthControllerTypes.LoginDTO) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler
  implements
    ICommandHandler<LoginCommand, AuthControllerTypes.LoginResponseServiceDTO>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bcryptService: BcryptService,
    private readonly tokensService: JwtTokensService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<AuthControllerTypes.LoginResponseServiceDTO> {
    const { data } = command;

    const user = await this.getUser({
      email: data.email,
      password: data.password,
    });

    const refreshTokenPromise: Promise<string> = this.createSession({
      userId: user.id,
      username: user.username,
    });

    const accessTokenPromise: Promise<string> =
      this.tokensService.createAccessToken({
        userId: user.id,
        username: user.username,
      });

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      accessToken,
      refreshToken,
      userProfile: {
        userId: user.profile.userId,
        username: user.profile.username,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        dateOfBirth: user.profile.dateOfBirth,
        country: user.profile.country,
        city: user.profile.city,
        aboutMe: user.profile.aboutMe,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
        deletedAt: user.profile.deletedAt,
        canModify: true,
      },
    };
  }

  async getUser(userLoginDTO: { email: string; password: string }) {
    const foundUser = await this.userQueryRepository.getUserByEmail(
      userLoginDTO.email,
    );

    const unauthorizedErr = {
      message: 'The email or password are incorrect. Try again',
      status: HttpStatus.UNAUTHORIZED,
    };

    if (!foundUser) {
      throw new CustomRpcException(unauthorizedErr);
    }

    const passwordIsCorrect: boolean =
      await this.bcryptService.compareHashAndPassword({
        password: userLoginDTO.password,
        hash: foundUser.password,
      });

    if (!passwordIsCorrect) {
      throw new CustomRpcException(unauthorizedErr);
    }

    return foundUser;
  }

  async createSession(data: {
    userId: number;
    username: string;
  }): Promise<string> {
    const { userId, username } = data;

    const refreshToken: RefreshTokenCreateType =
      await this.tokensService.createRefreshToken({
        userId,
        username,
        uuid: crypto.randomUUID(),
      });

    const refreshTokenExpiresAtDate: Date = new Date(
      refreshToken.payload.exp * 1000,
    );

    await this.userRepository.createSession({
      userId,
      refreshTokenUuid: refreshToken.payload.uuid,
      expiresAt: refreshTokenExpiresAtDate,
    });

    return refreshToken.token;
  }
}
