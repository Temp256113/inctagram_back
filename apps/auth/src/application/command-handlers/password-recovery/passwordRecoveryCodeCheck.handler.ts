import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryCodeCheckFunction } from '../common/passwordRecoveryCodeCheckFunction';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { PasswordRecoveryCodeCheckDTO } from '@libs/common-types/auth/controller';

export class PasswordRecoveryCodeCheckCommand {
  constructor(public readonly data: PasswordRecoveryCodeCheckDTO) {}
}

@CommandHandler(PasswordRecoveryCodeCheckCommand)
export class PasswordRecoveryCodeCheckHandler
  extends PasswordRecoveryCodeCheckFunction
  implements ICommandHandler<PasswordRecoveryCodeCheckCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
  ) {
    super({
      userRepository,
      userQueryRepository,
    });
  }

  async execute({ data }: PasswordRecoveryCodeCheckCommand): Promise<void> {
    await this.checkPasswordRecoveryCode(data.passwordRecoveryCode);
  }
}
