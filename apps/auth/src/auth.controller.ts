import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';
import * as AuthMicroserviceTypes from '@libs/common-types/auth/microservice';
import * as Commands from './application/command-handlers/index';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenUserType } from '@libs/common-types/guards/refreshToken.guard.types';
import { AuthMicroservicePatterns } from '@libs/microservice-patterns';

@Controller()
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(AuthMicroservicePatterns.GOOGLE_AUTH)
  async authViaGoogle(
    @Payload() payload: AuthGatewayControllerTypes.SideAuthDTO,
  ): Promise<AuthMicroserviceTypes.SideAuthSchema> {
    return this.commandBus.execute(
      new Commands.GoogleAuthCommand({ code: payload.code }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.GITHUB_AUTH)
  async authViaGithub(
    @Payload() payload: AuthGatewayControllerTypes.SideAuthDTO,
  ): Promise<AuthMicroserviceTypes.SideAuthSchema> {
    return this.commandBus.execute(
      new Commands.GithubAuthCommand({ code: payload.code }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.USER_REGISTER)
  async register(
    @Payload() payload: AuthGatewayControllerTypes.RegisterDTO,
  ): Promise<void> {
    console.log('register route is executed');

    await this.commandBus.execute(
      new Commands.RegisterCommand({
        email: payload.email,
        password: payload.password,
        username: payload.username,
      }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.REGISTER_CODE_CHECK)
  async checkRegisterCode(
    @Payload() payload: AuthGatewayControllerTypes.RegisterCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.RegisterCodeCheckCommand({ code: payload.code }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.RESEND_REGISTER_EMAIL)
  async resendRegisterConfirmEmail(
    @Payload() payload: AuthGatewayControllerTypes.ResendRegisterEmailDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.ResendRegisterEmailCommand({ userEmail: payload.userEmail }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.USER_LOGIN)
  async login(
    @Payload() payload: AuthGatewayControllerTypes.LoginDTO,
  ): Promise<AuthMicroserviceTypes.LoginSchema> {
    return this.commandBus.execute(
      new Commands.LoginCommand({
        email: payload.email,
        password: payload.password,
      }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.UPDATE_TOKENS_PAIR)
  async updateTokensPair(
    @Payload() payload: RefreshTokenUserType,
  ): Promise<AuthMicroserviceTypes.UpdateTokensPairSchema> {
    return this.commandBus.execute(
      new Commands.UpdateTokensPairCommand(payload),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.USER_LOGOUT)
  async logout(
    @Payload() payload: AuthMicroserviceTypes.LogoutDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.LogoutCommand({
        userId: payload.userId,
        refreshTokenUuid: payload.refreshTokenUuid,
      }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.CREATE_PASSWORD_RECOVERY_REQUEST)
  async passwordRecoveryRequest(
    @Payload() payload: AuthGatewayControllerTypes.PasswordRecoveryRequestDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.PasswordRecoveryRequestCommand({
        email: payload.email,
        recaptchaToken: payload.recaptchaToken,
      }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.PASSWORD_RECOVERY_CODE_CHECK)
  async passwordRecoveryCodeCheck(
    @Payload() payload: AuthGatewayControllerTypes.PasswordRecoveryCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.PasswordRecoveryCodeCheckCommand({
        passwordRecoveryCode: payload.passwordRecoveryCode,
      }),
    );
  }

  @MessagePattern(AuthMicroservicePatterns.PASSWORD_RECOVERY)
  async passwordRecovery(
    @Payload() payload: AuthGatewayControllerTypes.PasswordRecoveryDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.PasswordRecoveryCommand({
        passwordRecoveryCode: payload.passwordRecoveryCode,
        password: payload.password,
      }),
    );
  }
}
