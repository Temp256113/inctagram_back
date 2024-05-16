import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryCodeCheckUtils } from '../common/passwordRecoveryCodeCheckUtils';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { PasswordRecoveryCodeCheckDTO } from '@libs/common-types/auth/controller';

export class PasswordRecoveryCodeCheckCommand {
  constructor(public readonly data: PasswordRecoveryCodeCheckDTO) {}
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
    const passwordRecoveryCodeCheckUtils: PasswordRecoveryCodeCheckUtils =
      await PasswordRecoveryCodeCheckUtils.create({
        passwordRecoveryCode: data.passwordRecoveryCode,
        userQueryRepository: this.userQueryRepository,
        userRepository: this.userRepository,
      });

    await passwordRecoveryCodeCheckUtils.checkPasswordRecoveryCode();
  }
}
