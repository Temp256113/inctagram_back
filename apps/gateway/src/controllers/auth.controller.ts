import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Put,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { LoginRouteSwaggerDescription } from '../../../first-app/src/auth/swagger/controllers/auth/login.route.swagger';
import { Response as Res } from 'express';
import { UpdateTokensPairRouteSwaggerDescription } from '../../../first-app/src/auth/swagger/controllers/auth/updateTokensPair.route.swagger';
import { Cookies } from '../../../first-app/src/auth/decorators/cookies.decorator';
import { JwtTokensService, TokensVariables } from '@libs/jwt-token';
import { UpdateTokensPairCommand } from '../../../first-app/src/auth/application/command-handlers/updateTokensPair.handler';
import { LogoutRouteSwaggerDescription } from '../../../first-app/src/auth/swagger/controllers/auth/logout.route.swagger';
import { LogoutCommand } from '../../../first-app/src/auth/application/command-handlers/logout.handler';
import { lastValueFrom } from 'rxjs';
import * as AuthControllerTypes from '@libs/common-types/auth/controller';

@Controller('auth')
@ApiTags('auth controller')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    private readonly jwtTokensService: JwtTokensService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginRouteSwaggerDescription()
  async login(
    @Body() userLoginDTO: AuthControllerTypes.LoginDTO,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthControllerTypes.LoginReturnGatewayDTO> {
    const tokens: AuthControllerTypes.LoginReturnServiceDTO =
      await lastValueFrom(this.authClient.send('login', userLoginDTO));

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: tokens.refreshToken,
      res,
    });

    return {
      accessToken: tokens.accessToken,
      userId: tokens.userId,
      username: tokens.username,
    };
  }

  /*@Put('update-tokens-pair')
  @HttpCode(HttpStatus.CREATED)
  @UpdateTokensPairRouteSwaggerDescription()
  async updateTokensPair(
    @Cookies(TokensVariables.REFRESH_TOKEN_COOKIE_TITLE) refreshToken: string,
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
    @Cookies(TokensVariables.REFRESH_TOKEN_COOKIE_TITLE) refreshToken: string,
  ): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException('Provide refresh token for logout');
    }

    await this.commandBus.execute(new LogoutCommand({ refreshToken }));
  }*/
}
