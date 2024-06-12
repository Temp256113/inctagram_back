import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryUtils } from './passwordRecoveryUtils';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import * as AuthGatewayControllerTypes from 'libs/common-types/src/auth/gateway';

export class PasswordRecoveryCodeCheckCommand {
  constructor(
    public readonly data: AuthGatewayControllerTypes.PasswordRecoveryCodeCheckDTO,
  ) {}
}

@CommandHandler(PasswordRecoveryCodeCheckCommand)
export class PasswordRecoveryCodeCheckHandler
  implements ICommandHandler<PasswordRecoveryCodeCheckCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ data }: PasswordRecoveryCodeCheckCommand): Promise<void> {
    const passwordRecoveryUtils: PasswordRecoveryUtils =
      await PasswordRecoveryUtils.create({
        passwordRecoveryCode: data.passwordRecoveryCode,
        userQueryRepository: this.userQueryRepository,
        userRepository: this.userRepository,
      });

    await passwordRecoveryUtils.checkPasswordRecoveryCode();
  }
}
