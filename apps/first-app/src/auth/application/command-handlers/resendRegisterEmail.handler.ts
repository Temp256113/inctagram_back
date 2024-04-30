import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../repositories/user.repository';
import { NodemailerService } from '../../utils/nodemailer.service';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { GoneException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { add } from 'date-fns';
import { ResendRegisterEmailDto } from '../../dto/register.dto';

export class ResendRegisterEmailCommand {
  constructor(public readonly data: ResendRegisterEmailDto) {}
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
      throw new NotFoundException('User with provided email is not found');
    }

    const emailIsConfirmed: boolean = foundUser.userEmailInfo.emailIsConfirmed;

    if (emailIsConfirmed) {
      throw new GoneException('User email is already confirmed');
    }

    const confirmEmailCode: string = crypto.randomUUID();

    await this.userRepository.updateEmailInfoByUserId(foundUser.id, {
      expiresAt: add(new Date(), { days: 3 }),
      emailConfirmCode: confirmEmailCode,
    });

    await this.nodemailerService.sendRegistrationConfirmMessage({
      email: foundUser.email,
      confirmCode: confirmEmailCode,
    });
  }
}
