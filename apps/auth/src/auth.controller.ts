import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomRpcException } from '@libs/common-exceptions';
import * as ControllerTypes from '@libs/common-types/auth/controller';
import * as Commands from './application/command-handlers/index';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenUserType } from '@libs/common-guards';

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
    @Payload() payload: ControllerTypes.SideAuthDTO,
  ): Promise<ControllerTypes.SideAuthResponseServiceDTO> {
    return this.commandBus.execute(
      new Commands.GoogleAuthCommand({ googleCode: payload.code }),
    );
  }

  @MessagePattern('register')
  async register(
    @Payload() payload: ControllerTypes.RegisterDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.RegisterCommand({
        email: payload.email,
        password: payload.password,
        username: payload.username,
      }),
    );
  }

  @MessagePattern('register-code-check')
  async checkRegisterCode(
    @Payload() payload: ControllerTypes.RegisterCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.RegisterCodeCheckCommand(payload.code),
    );
  }

  @MessagePattern('resend-register-email')
  async resendRegisterConfirmEmail(
    @Payload() payload: ControllerTypes.ResendRegisterEmailDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.ResendRegisterEmailCommand({ userEmail: payload.userEmail }),
    );
  }

  @MessagePattern('login')
  async login(
    @Payload() payload: ControllerTypes.LoginDTO,
  ): Promise<ControllerTypes.LoginResponseServiceDTO> {
    return this.commandBus.execute(
      new Commands.LoginCommand({
        email: payload.email,
        password: payload.password,
      }),
    );
  }

  @MessagePattern('update-tokens-pair')
  async updateTokensPair(
    @Payload() payload: RefreshTokenUserType,
  ): Promise<ControllerTypes.UpdateTokensPairResponseServiceDTO> {
    return this.commandBus.execute(
      new Commands.UpdateTokensPairCommand({
        userId: payload.userId,
        username: payload.username,
        refreshTokenUuid: payload.refreshTokenUuid,
      }),
    );
  }

  @MessagePattern('logout')
  async logout(
    @Payload() payload: ControllerTypes.LogoutServiceDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.LogoutCommand({
        userId: payload.userId,
        refreshTokenUuid: payload.refreshTokenUuid,
      }),
    );
  }

  @MessagePattern('password-recovery-request')
  async passwordRecoveryRequest(
    @Payload() payload: ControllerTypes.PasswordRecoveryRequestDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.PasswordRecoveryRequestCommand({
        email: payload.email,
        recaptchaToken: payload.recaptchaToken,
      }),
    );
  }

  @MessagePattern('password-recovery-code-check')
  async passwordRecoveryCodeCheck(
    @Payload() payload: ControllerTypes.PasswordRecoveryCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.PasswordRecoveryCodeCheckCommand({
        passwordRecoveryCode: payload.passwordRecoveryCode,
      }),
    );
  }

  @MessagePattern('password-recovery')
  async passwordRecovery(
    @Payload() payload: ControllerTypes.PasswordRecoveryDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new Commands.PasswordRecoveryCommand({
        passwordRecoveryCode: payload.passwordRecoveryCode,
        newPassword: payload.password,
      }),
    );
  }
}
