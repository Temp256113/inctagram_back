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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Response as Res } from 'express';
import { JwtTokensService } from '@libs/jwt-token';
import { lastValueFrom } from 'rxjs';
import * as AuthControllerTypes from '@libs/common-types/auth/controller';
import { RefreshTokenGuard, RefreshTokenUserType } from '@libs/common-guards';
import { User } from '@libs/common-decorators';
import { Cookies } from '../../decorators/cookies.decorator';
import { LoginRouteSwaggerDescription } from './swagger/login.route.swagger';
import { UpdateTokensPairRouteSwaggerDescription } from './swagger/updateTokensPair.route.swagger';
import { LogoutRouteSwaggerDescription } from './swagger/logout.route.swagger';

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
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @LogoutRouteSwaggerDescription()
  async logout(
    @Cookies(JwtTokensService.refreshTokenCookieTitle) refreshToken: string,
    @User() refreshTokenData: RefreshTokenUserType,
  ): Promise<void> {
    await lastValueFrom(this.authClient.send('logout', refreshTokenData), {
      defaultValue: null,
    });
  }
}
