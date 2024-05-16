import { Prisma, UserChangePasswordRequestStates } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';
import { isBefore } from 'date-fns';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import {
  CustomRpcException,
  CustomRpcExceptionDTO,
} from '@libs/common-exceptions';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryCodeCheckErrorType
  implements CustomRpcExceptionDTO
{
  @ApiProperty({
    description: 'User email of provided code',
    example: 'temp.256113@gmail.com',
  })
  userEmail: string;

  @ApiProperty({ description: 'Just message', type: 'string' })
  message: string;

  @ApiProperty({ type: 'number', example: 410 })
  status: HttpStatus.GONE;
}

export class PasswordRecoveryCodeCheckUtils {
  private readonly changePasswordRequest: Prisma.UserChangePasswordRequestGetPayload<{
    include: { user: true };
  }>;

  private constructor(
    private readonly dependencies: {
      userQueryRepository: UserQueryRepository;
      userRepository: UserRepository;
      changePasswordRequest: Prisma.UserChangePasswordRequestGetPayload<{
        include: { user: true };
      }>;
    },
  ) {
    this.changePasswordRequest = dependencies.changePasswordRequest;
  }

  public static async create(data: {
    userQueryRepository: UserQueryRepository;
    userRepository: UserRepository;
    passwordRecoveryCode: string;
  }): Promise<PasswordRecoveryCodeCheckUtils> {
    const foundChangePasswordRequest =
      await data.userQueryRepository.getPasswordRecoveryRequestByCode({
        recoveryCode: data.passwordRecoveryCode,
        state: UserChangePasswordRequestStates.pending,
        deleted: false,
      });

    return new PasswordRecoveryCodeCheckUtils({
      ...data,
      changePasswordRequest: foundChangePasswordRequest,
    });
  }

  public async checkPasswordRecoveryCode(): Promise<void> {
    const foundChangePasswordRequest = this.changePasswordRequest;

    if (!foundChangePasswordRequest) {
      throw new CustomRpcException({
        message: 'Change password request is not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const passwordRecoveryCodeIsExpired = isBefore(
      foundChangePasswordRequest.expiresAt,
      new Date(),
    );

    if (!passwordRecoveryCodeIsExpired) {
      return;
    }

    await this.dependencies.userRepository.softDeleteChangePasswordRequest(
      foundChangePasswordRequest.id,
    );

    const passwordRecoveryCodeIsExpiredErr: PasswordRecoveryCodeCheckErrorType =
      {
        message: 'Provided password recovery code is expired',
        status: HttpStatus.GONE,
        userEmail: foundChangePasswordRequest.user.email,
      };

    throw new CustomRpcException(passwordRecoveryCodeIsExpiredErr);
  }

  public getChangePasswordRequest(): Prisma.UserChangePasswordRequestGetPayload<{
    include: { user: true };
  }> {
    return this.changePasswordRequest;
  }
}
