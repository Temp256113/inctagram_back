import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { isBefore } from 'date-fns';
import { NodemailerService } from '../../utils/nodemailer.service';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import {
  RpcCustomException,
  CustomRpcExceptionDTO,
} from '@libs/common-exceptions';
import { ApiProperty } from '@nestjs/swagger';
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';

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
  constructor(
    public readonly data: AuthGatewayControllerTypes.RegisterCodeCheckDTO,
  ) {}
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
      command.data.code,
    );

    if (!foundUser) {
      throw new RpcCustomException({
        message: 'User with provided code is not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const codeIsExpired: boolean = isBefore(
      foundUser.emailInfo.emailConfirmCodeExpiresAt,
      new Date(),
    );

    if (codeIsExpired) {
      const codeIsExpiredErr: RegisterCodeCheckResponseErrorType = {
        message: 'Provided code is expired',
        status: HttpStatus.GONE,
        userEmail: foundUser.email,
      };

      throw new RpcCustomException(codeIsExpiredErr);
    }

    const updateUserEmailInfo = this.userRepository.updateEmailInfoByUserId(
      foundUser.id,
      {
        emailConfirmCodeExpiresAt: null,
        emailIsConfirmed: true,
        emailConfirmCode: null,
      },
    );

    const sendRegistrationSuccessfulEmail =
      this.nodemailerService.sendRegistrationSuccessfulMessage(foundUser.email);

    await Promise.all([updateUserEmailInfo, sendRegistrationSuccessfulEmail]);
  }
}
