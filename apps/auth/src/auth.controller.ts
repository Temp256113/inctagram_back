import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomRpcException } from '@libs/common-exceptions';
import * as AuthControllerTypes from '@libs/common-types/auth/controller';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from './application/command-handlers/login.handler';
import { UpdateTokensPairCommand } from './application/command-handlers/updateTokensPair.handler';
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

  @MessagePattern('login')
  async login(
    @Payload() payload: AuthControllerTypes.LoginDTO,
  ): Promise<AuthControllerTypes.LoginResponseServiceDTO> {
    return this.commandBus.execute(new LoginCommand({ userLoginDTO: payload }));
  }

  @MessagePattern('update-tokens-pair')
  async updateTokensPair(
    @Payload() payload: RefreshTokenUserType,
  ): Promise<AuthControllerTypes.LoginResponseServiceDTO> {
    return this.commandBus.execute(new UpdateTokensPairCommand(payload));
  }
}
