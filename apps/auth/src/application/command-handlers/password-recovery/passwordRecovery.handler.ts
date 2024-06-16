import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptService } from '../../../utils/bcrypt.service';
import { PasswordRecoveryUtils } from './passwordRecoveryUtils';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';

export class PasswordRecoveryCommand {
  constructor(
    public readonly data: AuthGatewayControllerTypes.PasswordRecoveryDTO,
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
      data: { password: newPassword, passwordRecoveryCode },
    } = command;

    const passwordRecoveryUtils: PasswordRecoveryUtils =
      await PasswordRecoveryUtils.create({
        userQueryRepository: this.userQueryRepository,
        userRepository: this.userRepository,
        passwordRecoveryCode,
      });

    await passwordRecoveryUtils.checkPasswordRecoveryCode();

    const foundChangePasswordRequest =
      passwordRecoveryUtils.getChangePasswordRequest();

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
