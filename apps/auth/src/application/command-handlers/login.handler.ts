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
  constructor(
    public readonly data: {
      userLoginDTO: AuthControllerTypes.LoginDTO;
    },
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler
  implements
    ICommandHandler<LoginCommand, AuthControllerTypes.LoginReturnServiceDTO>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bcryptService: BcryptService,
    private readonly tokensService: JwtTokensService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<AuthControllerTypes.LoginReturnServiceDTO> {
    const {
      data: { userLoginDTO },
    } = command;

    const user = await this.getUser(userLoginDTO);

    const refreshToken: string = await this.createSession(user.id);

    const accessToken: string = await this.tokensService.createAccessToken(
      user.id,
    );

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      username: user.username,
    };
  }

  async getUser(userLoginDTO: AuthControllerTypes.LoginDTO) {
    const foundUser = await this.userQueryRepository.getUserByEmail(
      userLoginDTO.email,
    );

    const unauthorizedErr = {
      message: 'The email or password are incorrect. Try again please',
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

  async createSession(userId: number): Promise<string> {
    const refreshToken: RefreshTokenCreateType =
      await this.tokensService.createRefreshToken({
        userId,
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
