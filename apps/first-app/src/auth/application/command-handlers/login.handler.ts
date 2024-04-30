import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginDTO } from '../../dto/login.dto';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { BcryptService } from '../../utils/bcrypt.service';
import { Response } from 'express';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { TokensService } from '../../utils/tokens.service';
import { RefreshTokenPayloadType } from '../../types/tokens.models';
import * as crypto from 'crypto';
import { UserRepository } from '../../repositories/user.repository';

export class LoginCommand {
  constructor(
    public readonly data: { userLoginDTO: LoginDTO; res: Response },
  ) {}
}

// возвращает id юзера если логин прошел успешно
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bcryptService: BcryptService,
    private readonly tokensService: TokensService,
  ) {}

  async execute(command: LoginCommand): Promise<void> {
    const {
      data: { userLoginDTO, res },
    } = command;

    const user = await this.getUser(userLoginDTO);

    await this.createSession({ userId: user.id, res });

    const accessToken: string = await this.tokensService.createAccessToken(
      user.id,
    );

    res
      .status(HttpStatus.OK)
      .send({ accessToken, userId: user.id, username: user.username });
  }

  async getUser(userLoginDTO: LoginDTO) {
    const foundUser = await this.userQueryRepository.getUserByEmail(
      userLoginDTO.email,
    );

    const errorDescription =
      'The email or password are incorrect. Try again please';

    if (!foundUser) {
      throw new UnauthorizedException(errorDescription);
    }

    const passwordIsCorrect: boolean =
      await this.bcryptService.compareHashAndPassword({
        password: userLoginDTO.password,
        hash: foundUser.password,
      });

    if (!passwordIsCorrect) {
      throw new UnauthorizedException(errorDescription);
    }

    return foundUser;
  }

  async createSession(data: { userId: number; res: Response }) {
    const { userId, res } = data;

    const refreshToken: string = await this.tokensService.createRefreshToken({
      userId,
      uuid: crypto.randomUUID(),
    });

    const refreshTokenPayload: RefreshTokenPayloadType =
      this.tokensService.getTokenPayload(refreshToken);

    const refreshTokenExpiresAtDate: Date = new Date(
      refreshTokenPayload.exp * 1000,
    );

    await this.userRepository.createSession({
      userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
      expiresAt: refreshTokenExpiresAtDate,
    });

    await this.tokensService.setRefreshTokenInCookie({ refreshToken, res });
  }
}
