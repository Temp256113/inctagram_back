import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryCodeCheckUtils } from '../common/passwordRecoveryCodeCheckUtils';
import { BcryptService } from '../../../utils/bcrypt.service';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';

export class PasswordRecoveryCommand {
  constructor(
    public readonly data: {
      newPassword: string;
      passwordRecoveryCode: string;
    },
  ) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const {
      data: { newPassword, passwordRecoveryCode },
    } = command;

    const passwordRecoveryCodeCheckUtils: PasswordRecoveryCodeCheckUtils =
      await PasswordRecoveryCodeCheckUtils.create({
        userQueryRepository: this.userQueryRepository,
        userRepository: this.userRepository,
        passwordRecoveryCode,
      });

    await passwordRecoveryCodeCheckUtils.checkPasswordRecoveryCode();

    const foundChangePasswordRequest =
      passwordRecoveryCodeCheckUtils.getChangePasswordRequest();

    const passwordHash: string =
      await this.bcryptService.encryptPassword(newPassword);

    await this.userRepository.softDeleteChangePasswordRequestAndChangePasswordTransaction(
      {
        changePasswordRequestId: foundChangePasswordRequest.id,
        changePasswordData: {
          userId: foundChangePasswordRequest.userId,
          password: passwordHash,
        },
      },
    );
  }
}
