import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomRpcException } from '@libs/common-exceptions';
import * as AuthControllerTypes from '@libs/common-types/auth/controller';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from './application/command-handlers/login.handler';
import { UpdateTokensPairCommand } from './application/command-handlers/updateTokensPair.handler';
import { RefreshTokenUserType } from '@libs/common-guards';
import { LogoutCommand } from './application/command-handlers/logout.handler';
import { PasswordRecoveryRequestCommand } from './application/command-handlers/password-recovery/passwordRecoveryRequest.handler';
import { PasswordRecoveryCodeCheckCommand } from './application/command-handlers/password-recovery/passwordRecoveryCodeCheck.handler';
import { PasswordRecoveryCommand } from './application/command-handlers/password-recovery/passwordRecovery.handler';
import { RegisterCommand } from './application/command-handlers/register.handler';
import { RegisterCodeCheckCommand } from './application/registerCodeCheckHandler';
import { ResendRegisterEmailCommand } from './application/command-handlers/resendRegisterEmail.handler';
import { GoogleAuthCommand } from './application/command-handlers/googleAuth.handler';

@Controller()
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('test_pattern')
  getHello(payload: any): string {
    console.log('payload', payload);
    throw new CustomRpcException({
      message: 'я выкинул ошибку из auth service controller',
      status: 404,
    });
    return `${payload.hello} rabbitmq`;
  }

  @MessagePattern('google-auth')
  async authViaGoogle(
    @Payload() payload: AuthControllerTypes.SideAuthDTO,
  ): Promise<AuthControllerTypes.SideAuthResponseServiceDTO> {
    return this.commandBus.execute(
      new GoogleAuthCommand({ googleCode: payload.code }),
    );
  }

  @MessagePattern('register')
  async register(
    @Payload() payload: AuthControllerTypes.RegisterDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new RegisterCommand({
        email: payload.email,
        password: payload.password,
        username: payload.username,
      }),
    );
  }

  @MessagePattern('register-code-check')
  async checkRegisterCode(
    @Payload() payload: AuthControllerTypes.RegisterCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(new RegisterCodeCheckCommand(payload.code));
  }

  @MessagePattern('resend-register-email')
  async resendRegisterConfirmEmail(
    @Payload() payload: AuthControllerTypes.ResendRegisterEmailDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResendRegisterEmailCommand({ userEmail: payload.userEmail }),
    );
  }

  @MessagePattern('login')
  async login(
    @Payload() payload: AuthControllerTypes.LoginDTO,
  ): Promise<AuthControllerTypes.LoginResponseServiceDTO> {
    return this.commandBus.execute(
      new LoginCommand({ email: payload.email, password: payload.password }),
    );
  }

  @MessagePattern('update-tokens-pair')
  async updateTokensPair(
    @Payload() payload: RefreshTokenUserType,
  ): Promise<AuthControllerTypes.UpdateTokensPairResponseServiceDTO> {
    return this.commandBus.execute(
      new UpdateTokensPairCommand({
        userId: payload.userId,
        username: payload.username,
        refreshTokenUuid: payload.refreshTokenUuid,
      }),
    );
  }

  @MessagePattern('logout')
  async logout(
    @Payload() payload: AuthControllerTypes.LogoutServiceDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new LogoutCommand({
        userId: payload.userId,
        refreshTokenUuid: payload.refreshTokenUuid,
      }),
    );
  }

  @MessagePattern('password-recovery-request')
  async passwordRecoveryRequest(
    @Payload() payload: AuthControllerTypes.PasswordRecoveryRequestDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryRequestCommand({
        email: payload.email,
        recaptchaToken: payload.recaptchaToken,
      }),
    );
  }

  @MessagePattern('password-recovery-code-check')
  async passwordRecoveryCodeCheck(
    @Payload() payload: AuthControllerTypes.PasswordRecoveryCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryCodeCheckCommand({
        passwordRecoveryCode: payload.passwordRecoveryCode,
      }),
    );
  }

  @MessagePattern('password-recovery')
  async passwordRecovery(
    @Payload() payload: AuthControllerTypes.PasswordRecoveryDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryCommand({
        passwordRecoveryCode: payload.passwordRecoveryCode,
        newPassword: payload.password,
      }),
    );
  }
}
