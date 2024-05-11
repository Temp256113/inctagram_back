import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { LoginRouteSwaggerDescription } from '../../../first-app/src/auth/swagger/controllers/auth/login.route.swagger';
import { Response as Res } from 'express';
import { UpdateTokensPairRouteSwaggerDescription } from '../../../first-app/src/auth/swagger/controllers/auth/updateTokensPair.route.swagger';
import { Cookies } from '../../../first-app/src/auth/decorators/cookies.decorator';
import { JwtTokensService } from '@libs/jwt-token';
import { LogoutRouteSwaggerDescription } from '../../../first-app/src/auth/swagger/controllers/auth/logout.route.swagger';
import { LogoutCommand } from '../../../first-app/src/auth/application/command-handlers/logout.handler';
import { lastValueFrom } from 'rxjs';
import * as AuthControllerTypes from '@libs/common-types/auth/controller';
import { RefreshTokenGuard, RefreshTokenUserType } from '@libs/common-guards';
import { User } from '@libs/common-decorators';

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
  ): Promise<AuthControllerTypes.AccessTokenResponseGatewayDTO> {
    const tokens: AuthControllerTypes.LoginResponseServiceDTO =
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

  @Put('update-tokens-pair')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @UpdateTokensPairRouteSwaggerDescription()
  async updateTokensPair(
    @Cookies(JwtTokensService.refreshTokenCookieTitle) refreshToken: string,
    @User() refreshTokenData: RefreshTokenUserType,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthControllerTypes.AccessTokenResponseGatewayDTO> {
    const tokens: AuthControllerTypes.LoginResponseServiceDTO =
      await lastValueFrom(
        this.authClient.send('update-tokens-pair', refreshTokenData),
      );

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

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @LogoutRouteSwaggerDescription()
  async logout(
    @Cookies(JwtTokensService.refreshTokenCookieTitle) refreshToken: string,
  ): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException('Provide refresh token for logout');
    }

    await this.commandBus.execute(new LogoutCommand({ refreshToken }));
  }
}
