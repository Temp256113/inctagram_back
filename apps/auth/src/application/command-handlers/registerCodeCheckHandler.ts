import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { isBefore } from 'date-fns';
import { NodemailerService } from '../../utils/nodemailer.service';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import {
  CustomRpcException,
  CustomRpcExceptionDTO,
} from '@libs/common-exceptions';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCodeCheckResponseErrorType
  implements CustomRpcExceptionDTO
{
  @ApiProperty({ type: 'string' })
  message: string;

  @ApiProperty({ type: 'number' })
  status: number;

  @ApiProperty({
    description: 'temp.256113@gmail.com',
    example: '',
    type: 'string',
  })
  userEmail: string;
}

export class RegisterCodeCheckCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(RegisterCodeCheckCommand)
export class RegisterCodeCheckHandler
  implements ICommandHandler<RegisterCodeCheckCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}
  async execute(command: RegisterCodeCheckCommand): Promise<void> {
    const foundUser = await this.userQueryRepository.getUserByConfirmEmailCode(
      command.code,
    );

    if (!foundUser) {
      throw new CustomRpcException({
        message: 'User with provided code is not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const codeIsExpired: boolean = isBefore(
      foundUser.userEmailInfo.expiresAt,
      new Date(),
    );

    if (codeIsExpired) {
      const codeIsExpiredErr: RegisterCodeCheckResponseErrorType = {
        message: 'Provided code is expired',
        status: HttpStatus.GONE,
        userEmail: foundUser.email,
      };

      throw new CustomRpcException(codeIsExpiredErr);
    }

    const updateUserEmailInfo = this.userRepository.updateEmailInfoByUserId(
      foundUser.id,
      {
        expiresAt: null,
        emailIsConfirmed: true,
        emailConfirmCode: null,
      },
    );

    const sendRegistrationSuccessfulEmail =
      this.nodemailerService.sendRegistrationSuccessfulMessage(foundUser.email);

    await Promise.all([updateUserEmailInfo, sendRegistrationSuccessfulEmail]);
  }
}
