import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryCodeCheckDTO } from '../../../dto/passwordRecovery.dto';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { UserRepository } from '../../../repositories/user.repository';
import { PasswordRecoveryCodeCheckFunction } from '../common/passwordRecoveryCodeCheckFunction';

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
