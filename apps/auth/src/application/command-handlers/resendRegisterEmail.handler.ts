import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NodemailerService } from '../../utils/nodemailer.service';
import { HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { add } from 'date-fns';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { ResendRegisterEmailDTO } from '@libs/common-types/auth/controller';
import { CustomRpcException } from '@libs/common-exceptions';

export class ResendRegisterEmailCommand {
  constructor(public readonly data: ResendRegisterEmailDTO) {}
}

@CommandHandler(ResendRegisterEmailCommand)
export class ResendRegisterEmailHandler
  implements ICommandHandler<ResendRegisterEmailCommand, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: ResendRegisterEmailCommand): Promise<void> {
    const {
      data: { userEmail },
    } = command;

    const foundUser = await this.userQueryRepository.getUserByEmail(userEmail);

    if (!foundUser) {
      throw new CustomRpcException({
        message: 'User with provided email is not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const emailIsConfirmed: boolean = foundUser.userEmailInfo.emailIsConfirmed;

    if (emailIsConfirmed) {
      throw new CustomRpcException({
        message: 'User email is already confirmed',
        status: HttpStatus.GONE,
      });
    }

    const confirmRegistrationCode: string = crypto.randomUUID();

    const setNewConfirmRegistrationCode =
      this.userRepository.updateEmailInfoByUserId(foundUser.id, {
        expiresAt: add(new Date(), { days: 3 }),
        emailConfirmCode: confirmRegistrationCode,
      });

    const sendRegisterConfirmationEmail =
      this.nodemailerService.sendRegistrationConfirmMessage({
        email: foundUser.email,
        confirmCode: confirmRegistrationCode,
      });

    await Promise.all([
      setNewConfirmRegistrationCode,
      sendRegisterConfirmationEmail,
    ]);
  }
}
