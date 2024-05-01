import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryCodeCheckDTO } from '../../../dto/passwordRecovery.dto';
import { PasswordRecoveryCodeCheckFunction } from '../common/passwordRecoveryCodeCheckFunction';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';

export class PasswordRecoveryCodeCheckCommand {
  constructor(
    public readonly passwordRecoveryDTO: PasswordRecoveryCodeCheckDTO,
  ) {}
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

  async execute({
    passwordRecoveryDTO,
  }: PasswordRecoveryCodeCheckCommand): Promise<void> {
    await this.checkPasswordRecoveryCode(
      passwordRecoveryDTO.passwordRecoveryCode,
    );
  }
}
