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
import { RefreshTokenGuard, RefreshTokenUserType } from '@libs/common-guards';
import { User } from '@libs/common-decorators';
import { Cookies } from '../../decorators/cookies.decorator';
import { LoginRouteSwaggerDescription } from './swagger/login.route.swagger';
import { UpdateTokensPairRouteSwaggerDescription } from './swagger/updateTokensPair.route.swagger';
import { LogoutRouteSwaggerDescription } from './swagger/logout.route.swagger';
import { PasswordRecoveryRequestRouteSwaggerDescription } from './swagger/passwordRecoveryRequest.route.swagger';
import { PasswordRecoveryCodeCheckRouteSwaggerDescription } from './swagger/passwordRecoveryCodeCheck.route.swagger';
import { PasswordRecoveryRouteSwaggerDescription } from './swagger/passwordRecovery.route.swagger';
import { RegisterRouteSwaggerDescription } from './swagger/register.route.swagger';
import { RegisterCodeCheckRouteSwaggerDescription } from './swagger/registerCodeCheck.route.swagger';
import { ResendRegisterEmailRouteSwaggerDescription } from './swagger/resendRegisterEmail.route.swagger';
import { CheckRegisterCodeCommand } from '../../../../first-app/src/auth/application/checkRegisterCode.handler';
import { ResendRegisterEmailCommand } from '../../../../first-app/src/auth/application/command-handlers/resendRegisterEmail.handler';

@Controller('auth')
@ApiTags('auth controller')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    private readonly jwtTokensService: JwtTokensService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterRouteSwaggerDescription()
  async register(
    @Body() userRegisterDTO: AuthControllerTypes.RegisterDTO,
  ): Promise<void> {
    await lastValueFrom(this.authClient.send('register', userRegisterDTO), {
      defaultValue: null,
    });
  }

  @Post('register-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegisterCodeCheckRouteSwaggerDescription()
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
  @ResendRegisterEmailRouteSwaggerDescription()
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
    const tokens: AuthControllerTypes.UpdateTokensPairResponseServiceDTO =
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

  @Post('password-recovery-request')
  @HttpCode(HttpStatus.NO_CONTENT)
  @PasswordRecoveryRequestRouteSwaggerDescription()
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
  @PasswordRecoveryCodeCheckRouteSwaggerDescription()
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
  @PasswordRecoveryRouteSwaggerDescription()
  async passwordRecovery(
    @Body() passwordRecoveryDTO: AuthControllerTypes.PasswordRecoveryDTO,
  ): Promise<void> {
    await lastValueFrom(
      this.authClient.send('password-recovery', passwordRecoveryDTO),
      { defaultValue: null },
    );
  }
}
