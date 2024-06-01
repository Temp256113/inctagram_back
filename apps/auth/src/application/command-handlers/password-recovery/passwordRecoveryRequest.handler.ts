import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { add } from 'date-fns';
import { UserChangePasswordRequestStates } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';
import { NodemailerService } from '../../../utils/nodemailer.service';
import { RecaptchaService } from '../../../utils/recaptcha.service';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { CustomRpcException } from '@libs/common-exceptions';
import { PasswordRecoveryRequestDTO } from '@libs/common-types/auth/controller';

export class PasswordRecoveryRequestCommand {
  constructor(public readonly data: PasswordRecoveryRequestDTO) {}
}

@CommandHandler(PasswordRecoveryRequestCommand)
export class PasswordRecoveryRequestHandler
  implements ICommandHandler<PasswordRecoveryRequestCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly nodemailerService: NodemailerService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  async execute(command: PasswordRecoveryRequestCommand): Promise<void> {
    const {
      data: { email, recaptchaToken },
    } = command;

    await this.recaptchaService.validateToken(recaptchaToken);

    const foundUser = await this.userQueryRepository.getUserByEmail(email);

    if (!foundUser) {
      throw new CustomRpcException({
        message: 'User is not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    // при сбросе пароля надо сбросить пароль и сбросить активные сессии
    await this.userRepository.deleteUserPasswordAndDeleteAllSessionsTransaction(
      foundUser.id,
    );

    await this.sendChangePasswordMessageToUserEmail({
      userId: foundUser.id,
      email: foundUser.email,
    });
  }

  async sendChangePasswordMessageToUserEmail(data: {
    userId: number;
    email: string;
  }): Promise<void> {
    const foundChangePasswordRequest =
      await this.userQueryRepository.getPasswordRecoveryRequestByUserEmail({
        email: data.email,
        state: UserChangePasswordRequestStates.pending,
        deleted: false,
      });

    const passwordRecoveryCode: string = crypto.randomUUID();
    const expiresAt: Date = add(new Date(), { days: 1 });

    const sendEmailMessage = async () => {
      return this.nodemailerService.sendChangePasswordRequestMessage({
        email: data.email,
        userPasswordRecoveryCode: passwordRecoveryCode,
      });
    };

    if (foundChangePasswordRequest) {
      await this.userRepository.updateUserChangePasswordRequest(
        foundChangePasswordRequest.id,
        {
          expiresAt,
          passwordRecoveryCode,
          state: UserChangePasswordRequestStates.pending,
        },
      );

      await sendEmailMessage();
    } else {
      await this.userRepository.createUserChangePasswordRequest({
        userId: data.userId,
        passwordRecoveryCode,
        expiresAt,
      });

      await sendEmailMessage();
    }
  }
}
