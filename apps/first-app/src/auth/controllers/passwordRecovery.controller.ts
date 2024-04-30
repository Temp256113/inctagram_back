import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { PasswordRecoveryRequestRouteSwaggerDescription } from '../swagger/controllers/passwordRecovery/passwordRecoveryRequest.route.swagger';
import {
  PasswordRecoveryCodeCheckDTO,
  PasswordRecoveryDto,
  PasswordRecoveryRequestDTO,
} from '../dto/passwordRecovery.dto';
import { PasswordRecoveryRequestCommand } from '../application/command-handlers/password-recovery/passwordRecoveryRequest.handler';
import { PasswordRecoveryCodeCheckRouteSwaggerDescription } from '../swagger/controllers/passwordRecovery/passwordRecoveryCodeCheck.route.swagger';
import { PasswordRecoveryCodeCheckCommand } from '../application/command-handlers/password-recovery/passwordRecoveryCodeCheck.handler';
import { PasswordRecoveryRouteSwaggerDescription } from '../swagger/controllers/passwordRecovery/passwordRecovery.route.swagger';
import { PasswordRecoveryCommand } from '../application/command-handlers/password-recovery/passwordRecovery.handler';

@Controller('auth')
@ApiTags('auth controller')
export class PasswordRecoveryController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('password-recovery-request')
  @HttpCode(HttpStatus.OK)
  @PasswordRecoveryRequestRouteSwaggerDescription()
  async passwordRecoveryRequest(
    @Body() passwordRecoveryRequestDTO: PasswordRecoveryRequestDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryRequestCommand(passwordRecoveryRequestDTO),
    );
  }

  @Post('password-recovery-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @PasswordRecoveryCodeCheckRouteSwaggerDescription()
  async passwordRecoveryCodeCheck(
    @Body() passwordRecoveryCodeCheckDTO: PasswordRecoveryCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryCodeCheckCommand(passwordRecoveryCodeCheckDTO),
    );
  }

  @Patch('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @PasswordRecoveryRouteSwaggerDescription()
  async passwordRecovery(
    @Body() passwordRecoveryDTO: PasswordRecoveryDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryCommand({
        newPassword: passwordRecoveryDTO.password,
        passwordRecoveryCode: passwordRecoveryDTO.passwordRecoveryCode,
      }),
    );
  }
}
