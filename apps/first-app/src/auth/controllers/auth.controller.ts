import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO } from '../dto/login.dto';
import { CommandBus } from '@nestjs/cqrs';
import { Cookies } from '../decorators/cookies.decorator';
import { Response as Res } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { refreshTokenCookieTitle } from '../variables/refreshTokenTitle';
import { LoginRouteSwaggerDescription } from '../swagger/controllers/auth/login.route.swagger';
import { LoginCommand } from '../application/command-handlers/login.handler';
import { UpdateTokensPairRouteSwaggerDescription } from '../swagger/controllers/auth/updateTokensPair.route.swagger';
import { UpdateTokensPairCommand } from '../application/command-handlers/updateTokensPair.handler';
import { LogoutRouteSwaggerDescription } from '../swagger/controllers/auth/logout.route.swagger';
import { LogoutCommand } from '../application/command-handlers/logout.handler';

@Controller('auth')
@ApiTags('auth controller')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginRouteSwaggerDescription()
  async login(
    @Body() userLoginDTO: LoginDTO,
    @Response() res: Res,
  ): Promise<void> {
    await this.commandBus.execute(new LoginCommand({ userLoginDTO, res }));
  }

  @Put('update-tokens-pair')
  @HttpCode(HttpStatus.CREATED)
  @UpdateTokensPairRouteSwaggerDescription()
  async updateTokensPair(
    @Cookies(refreshTokenCookieTitle) refreshToken: string,
    @Response() res: Res,
  ): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Provide refresh token in cookies for update tokens pair',
      );
    }

    await this.commandBus.execute(
      new UpdateTokensPairCommand({ refreshToken, res }),
    );
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @LogoutRouteSwaggerDescription()
  async logout(
    @Cookies(refreshTokenCookieTitle) refreshToken: string,
  ): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException('Provide refresh token for logout');
    }

    await this.commandBus.execute(new LogoutCommand({ refreshToken }));
  }
}
