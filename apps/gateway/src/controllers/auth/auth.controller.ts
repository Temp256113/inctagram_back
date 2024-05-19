import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
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
import * as SwaggerRouteDecorators from './swagger';
import { RefreshTokenGuard, RefreshTokenUserType } from '@libs/common-guards';
import { User } from '@libs/common-decorators';
import { Cookies } from '../../decorators/cookies.decorator';
import { SideAuthResponseType } from '../../../../first-app/src/auth/dto/response/sideAuth.responseType';
import { GithubAuthCommand } from '../../../../first-app/src/auth/application/command-handlers/githubAuth.handler';

@Controller('auth')
@ApiTags('auth controller')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    private readonly jwtTokensService: JwtTokensService,
  ) {}

  @Post('google-auth')
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.SideAuth()
  async authViaGoogle(
    @Body() googleAuthCode: AuthControllerTypes.SideAuthDTO,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthControllerTypes.AccessTokenResponseGatewayDTO> {
    const tokensAndUserData: AuthControllerTypes.SideAuthResponseServiceDTO =
      await lastValueFrom(this.authClient.send('google-auth', googleAuthCode));

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: tokensAndUserData.refreshToken,
      res,
    });

    return {
      accessToken: tokensAndUserData.accessToken,
      userId: tokensAndUserData.userId,
      username: tokensAndUserData.username,
    };
  }

  @Post('github-auth')
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.SideAuth()
  async authViaGithub(
    @Cookies(JwtTokensService.refreshTokenCookieTitle)
    refreshToken: string | undefined,
    @Body() githubAuthCode: AuthControllerTypes.SideAuthDTO,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthControllerTypes.AccessTokenResponseGatewayDTO> {
    const userInfo: SideAuthResponseType = await this.commandBus.execute(
      new GithubAuthCommand({
        githubCode: githubAuthCode.code,
        res,
        refreshToken,
      }),
    );

    return userInfo;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @SwaggerRouteDecorators.Register()
  async register(
    @Body() userRegisterDTO: AuthControllerTypes.RegisterDTO,
  ): Promise<void> {
    await lastValueFrom(this.authClient.send('register', userRegisterDTO), {
      defaultValue: null,
    });
  }

  @Post('register-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.RegisterCodeCheck()
  async checkRegisterCode(
    @Body() registerCode: AuthControllerTypes.RegisterCodeCheckDTO,
  ): Promise<void> {
    await lastValueFrom(
      this.authClient.send('register-code-check', registerCode),
      {
        defaultValue: null,
      },
    );
  }

  @Patch('resend-register-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.ResendRegisterEmail()
  async sendEmail(
    @Body() resendEmailInfo: AuthControllerTypes.ResendRegisterEmailDTO,
  ): Promise<void> {
    await lastValueFrom(
      this.authClient.send('resend-register-email', resendEmailInfo),
      {
        defaultValue: null,
      },
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.Login()
  async login(
    @Body() userLoginDTO: AuthControllerTypes.LoginDTO,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthControllerTypes.AccessTokenResponseGatewayDTO> {
    const tokensAndUserData: AuthControllerTypes.LoginResponseServiceDTO =
      await lastValueFrom(this.authClient.send('login', userLoginDTO));

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: tokensAndUserData.refreshToken,
      res,
    });

    return {
      accessToken: tokensAndUserData.accessToken,
      userId: tokensAndUserData.userId,
      username: tokensAndUserData.username,
    };
  }

  @Put('update-tokens-pair')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @SwaggerRouteDecorators.UpdateTokensPair()
  async updateTokensPair(
    @Cookies(JwtTokensService.refreshTokenCookieTitle) refreshToken: string,
    @User() refreshTokenData: RefreshTokenUserType,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthControllerTypes.AccessTokenResponseGatewayDTO> {
    const tokensAndUserData: AuthControllerTypes.UpdateTokensPairResponseServiceDTO =
      await lastValueFrom(
        this.authClient.send('update-tokens-pair', refreshTokenData),
      );

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: tokensAndUserData.refreshToken,
      res,
    });

    return {
      accessToken: tokensAndUserData.accessToken,
      userId: tokensAndUserData.userId,
      username: tokensAndUserData.username,
    };
  }

  @Delete('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.Logout()
  async logout(
    @Cookies(JwtTokensService.refreshTokenCookieTitle) refreshToken: string,
    @User() refreshTokenData: RefreshTokenUserType,
  ): Promise<void> {
    await lastValueFrom(this.authClient.send('logout', refreshTokenData), {
      defaultValue: null,
    });
  }

  @Post('password-recovery-request')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.PasswordRecoveryRequest()
  async passwordRecoveryRequest(
    @Body()
    passwordRecoveryRequestDTO: AuthControllerTypes.PasswordRecoveryRequestDTO,
  ): Promise<void> {
    await lastValueFrom(
      this.authClient.send(
        'password-recovery-request',
        passwordRecoveryRequestDTO,
      ),
      { defaultValue: null },
    );
  }

  @Post('password-recovery-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.PasswordRecoveryCodeCheck()
  async passwordRecoveryCodeCheck(
    @Body()
    passwordRecoveryCodeCheckDTO: AuthControllerTypes.PasswordRecoveryCodeCheckDTO,
  ): Promise<void> {
    await lastValueFrom(
      this.authClient.send(
        'password-recovery-code-check',
        passwordRecoveryCodeCheckDTO,
      ),
      { defaultValue: null },
    );
  }

  @Patch('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.PasswordRecovery()
  async passwordRecovery(
    @Body() passwordRecoveryDTO: AuthControllerTypes.PasswordRecoveryDTO,
  ): Promise<void> {
    await lastValueFrom(
      this.authClient.send('password-recovery', passwordRecoveryDTO),
      { defaultValue: null },
    );
  }
}
