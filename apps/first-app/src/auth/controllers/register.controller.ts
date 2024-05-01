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
import { RegisterRouteSwaggerDescription } from '../swagger/controllers/register/register.route.swagger';
import {
  RegisterCodeCheckDTO,
  RegisterDTO,
  ResendRegisterEmailDto,
} from '../dto/register.dto';
import { RegistrationCommand } from '../application/command-handlers/registration.handler';
import { RegisterCodeCheckRouteSwaggerDescription } from '../swagger/controllers/register/registerCodeCheck.route.swagger';
import { CheckRegisterCodeCommand } from '../application/checkRegisterCode.handler';
import { ResendRegisterEmailRouteSwaggerDescription } from '../swagger/controllers/register/resendRegisterEmail.route.swagger';
import { ResendRegisterEmailCommand } from '../application/command-handlers/resendRegisterEmail.handler';

@Controller('auth')
@ApiTags('auth controller')
export class RegisterController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterRouteSwaggerDescription()
  async register(@Body() userRegistrationDTO: RegisterDTO): Promise<void> {
    await this.commandBus.execute(
      new RegistrationCommand({
        email: userRegistrationDTO.email,
        password: userRegistrationDTO.password,
        username: userRegistrationDTO.username,
      }),
    );
  }

  @Post('register-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegisterCodeCheckRouteSwaggerDescription()
  async checkRegisterCode(
    @Body() registerCode: RegisterCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new CheckRegisterCodeCommand(registerCode.code),
    );
  }

  @Patch('resend-register-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResendRegisterEmailRouteSwaggerDescription()
  async sendEmail(
    @Body() sendEmailInfo: ResendRegisterEmailDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResendRegisterEmailCommand(sendEmailInfo),
    );
  }
}
