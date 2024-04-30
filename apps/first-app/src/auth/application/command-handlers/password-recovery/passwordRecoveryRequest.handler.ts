import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { add } from 'date-fns';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { NodemailerService } from '../../../utils/nodemailer.service';
import { UserChangePasswordRequestStates } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../repositories/user.repository';
import { RecaptchaService } from '../../../utils/recaptcha.service';
import { PasswordRecoveryRequestDTO } from '../../../dto/passwordRecovery.dto';

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
      throw new NotFoundException('User not found');
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
