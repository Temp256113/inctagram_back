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
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';
import * as AuthMicroserviceTypes from '@libs/common-types/auth/microservice';
import * as SwaggerRouteDecorators from './swagger';
import { RefreshTokenGuard, RefreshTokenUserType } from '@libs/common-guards';
import { User } from '@libs/common-decorators';
import { AuthMicroservicePatterns } from './authMicroservice.patterns';

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
    @Body() googleAuthCode: AuthGatewayControllerTypes.SideAuthDTO,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthGatewayControllerTypes.LoginResponseDTO> {
    const authViaGooglePayload: AuthGatewayControllerTypes.SideAuthDTO = {
      code: googleAuthCode.code,
    };

    const tokensAndUserData: AuthMicroserviceTypes.SideAuthResponseDTO =
      await lastValueFrom(
        this.authClient.send(
          AuthMicroservicePatterns.GOOGLE_AUTH,
          authViaGooglePayload,
        ),
      );

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: tokensAndUserData.refreshToken,
      res,
    });

    return {
      accessToken: tokensAndUserData.accessToken,
      userProfile: tokensAndUserData.userProfile,
    };
  }

  @Post('github-auth')
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.SideAuth()
  async authViaGithub(
    @Body() githubAuthCode: AuthGatewayControllerTypes.SideAuthDTO,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthGatewayControllerTypes.LoginResponseDTO> {
    const authViaGithubPayload: AuthGatewayControllerTypes.SideAuthDTO = {
      code: githubAuthCode.code,
    };

    const tokensAndUserData: AuthMicroserviceTypes.SideAuthResponseDTO =
      await lastValueFrom(
        this.authClient.send(
          AuthMicroservicePatterns.GITHUB_AUTH,
          authViaGithubPayload,
        ),
      );

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: tokensAndUserData.refreshToken,
      res,
    });

    return {
      accessToken: tokensAndUserData.accessToken,
      userProfile: tokensAndUserData.userProfile,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @SwaggerRouteDecorators.Register()
  async register(
    @Body() userRegisterDTO: AuthGatewayControllerTypes.RegisterDTO,
  ): Promise<void> {
    const registerPayload: AuthGatewayControllerTypes.RegisterDTO = {
      email: userRegisterDTO.email,
      password: userRegisterDTO.password,
      username: userRegisterDTO.username,
    };

    await lastValueFrom(
      this.authClient.send(
        AuthMicroservicePatterns.USER_REGISTER,
        registerPayload,
      ),
      {
        defaultValue: null,
      },
    );
  }

  @Post('register-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.RegisterCodeCheck()
  async checkRegisterCode(
    @Body() registerCode: AuthGatewayControllerTypes.RegisterCodeCheckDTO,
  ): Promise<void> {
    const registerCodeCheckPayload: AuthGatewayControllerTypes.RegisterCodeCheckDTO =
      {
        code: registerCode.code,
      };

    await lastValueFrom(
      this.authClient.send(
        AuthMicroservicePatterns.REGISTER_CODE_CHECK,
        registerCodeCheckPayload,
      ),
      {
        defaultValue: null,
      },
    );
  }

  @Patch('resend-register-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.ResendRegisterEmail()
  async sendEmail(
    @Body() resendEmailInfo: AuthGatewayControllerTypes.ResendRegisterEmailDTO,
  ): Promise<void> {
    const resendRegisterEmailPayload: AuthGatewayControllerTypes.ResendRegisterEmailDTO =
      {
        userEmail: resendEmailInfo.userEmail,
      };

    await lastValueFrom(
      this.authClient.send(
        AuthMicroservicePatterns.RESEND_REGISTER_EMAIL,
        resendRegisterEmailPayload,
      ),
      {
        defaultValue: null,
      },
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.Login()
  async login(
    @Body() userLoginDTO: AuthGatewayControllerTypes.LoginDTO,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthGatewayControllerTypes.LoginResponseDTO> {
    const loginPayload: AuthGatewayControllerTypes.LoginDTO = {
      email: userLoginDTO.email,
      password: userLoginDTO.password,
    };

    const tokensAndUserData: AuthMicroserviceTypes.LoginResponseDTO =
      await lastValueFrom(
        this.authClient.send(AuthMicroservicePatterns.USER_LOGIN, loginPayload),
      );

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: tokensAndUserData.refreshToken,
      res,
    });

    return {
      accessToken: tokensAndUserData.accessToken,
      userProfile: tokensAndUserData.userProfile,
    };
  }

  @Put('update-tokens-pair')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @SwaggerRouteDecorators.UpdateTokensPair()
  async updateTokensPair(
    @User() user: RefreshTokenUserType,
    @Response({ passthrough: true }) res: Res,
  ): Promise<AuthGatewayControllerTypes.UpdateTokensPairResponseDTO> {
    const updateTokensPairPayload: RefreshTokenUserType = user;

    const newTokensPair: AuthMicroserviceTypes.UpdateTokensPairResponseDTO =
      await lastValueFrom(
        this.authClient.send(
          AuthMicroservicePatterns.UPDATE_TOKENS_PAIR,
          updateTokensPairPayload,
        ),
      );

    this.jwtTokensService.setRefreshTokenInCookie({
      refreshToken: newTokensPair.refreshToken,
      res,
    });

    return {
      accessToken: newTokensPair.accessToken,
    };
  }

  @Delete('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.Logout()
  async logout(@User() refreshTokenData: RefreshTokenUserType): Promise<void> {
    const logoutPayload: AuthMicroserviceTypes.LogoutDTO = {
      userId: refreshTokenData.user.id,
      refreshTokenUuid: refreshTokenData.refreshTokenUuid,
    };

    await lastValueFrom(
      this.authClient.send(AuthMicroservicePatterns.USER_LOGOUT, logoutPayload),
      {
        defaultValue: null,
      },
    );
  }

  @Post('password-recovery-request')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.PasswordRecoveryRequest()
  async passwordRecoveryRequest(
    @Body()
    passwordRecoveryRequestDTO: AuthGatewayControllerTypes.PasswordRecoveryRequestDTO,
  ): Promise<void> {
    const passwordRecoveryRequestPayload: AuthGatewayControllerTypes.PasswordRecoveryRequestDTO =
      {
        email: passwordRecoveryRequestDTO.email,
        recaptchaToken: passwordRecoveryRequestDTO.recaptchaToken,
      };

    await lastValueFrom(
      this.authClient.send(
        AuthMicroservicePatterns.CREATE_PASSWORD_RECOVERY_REQUEST,
        passwordRecoveryRequestPayload,
      ),
      { defaultValue: null },
    );
  }

  @Post('password-recovery-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.PasswordRecoveryCodeCheck()
  async passwordRecoveryCodeCheck(
    @Body()
    passwordRecoveryCodeCheckDTO: AuthGatewayControllerTypes.PasswordRecoveryCodeCheckDTO,
  ): Promise<void> {
    const passwordRecoveryCodeCheckPayload: AuthGatewayControllerTypes.PasswordRecoveryCodeCheckDTO =
      {
        passwordRecoveryCode: passwordRecoveryCodeCheckDTO.passwordRecoveryCode,
      };

    await lastValueFrom(
      this.authClient.send(
        AuthMicroservicePatterns.PASSWORD_RECOVERY_CODE_CHECK,
        passwordRecoveryCodeCheckPayload,
      ),
      { defaultValue: null },
    );
  }

  @Patch('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.PasswordRecovery()
  async passwordRecovery(
    @Body() passwordRecoveryDTO: AuthGatewayControllerTypes.PasswordRecoveryDTO,
  ): Promise<void> {
    const passwordRecoveryPayload: AuthGatewayControllerTypes.PasswordRecoveryDTO =
      {
        passwordRecoveryCode: passwordRecoveryDTO.passwordRecoveryCode,
        password: passwordRecoveryDTO.password,
      };

    await lastValueFrom(
      this.authClient.send(
        AuthMicroservicePatterns.PASSWORD_RECOVERY,
        passwordRecoveryPayload,
      ),
      { defaultValue: null },
    );
  }
}
