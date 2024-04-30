import { UserChangePasswordRequestStates } from '@prisma/client';
import { GoneException, NotFoundException } from '@nestjs/common';
import { isBefore } from 'date-fns';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { UserRepository } from '../../../repositories/user.repository';
import { PasswordRecoveryCodeCheckResponseTypeSwagger } from '../../../dto/passwordRecovery.dto';

export class PasswordRecoveryCodeCheckFunction {
  constructor(
    protected readonly dependencies: {
      userQueryRepository: UserQueryRepository;
      userRepository: UserRepository;
    },
  ) {}

  async checkPasswordRecoveryCode(passwordRecoveryCode: string) {
    const foundChangePasswordRequest =
      await this.dependencies.userQueryRepository.getPasswordRecoveryRequestByCode(
        {
          recoveryCode: passwordRecoveryCode,
          state: UserChangePasswordRequestStates.pending,
          deleted: false,
        },
      );

    if (!foundChangePasswordRequest) {
      throw new NotFoundException('Change password request not found');
    }

    const passwordRecoveryCodeIsExpired = isBefore(
      foundChangePasswordRequest.expiresAt,
      new Date(),
    );

    if (passwordRecoveryCodeIsExpired) {
      await this.dependencies.userRepository.softDeleteChangePasswordRequest(
        foundChangePasswordRequest.id,
      );

      throw new GoneException({
        message: 'Password token expired',
        userEmail: foundChangePasswordRequest.user.email,
      } as PasswordRecoveryCodeCheckResponseTypeSwagger);
    }

    return foundChangePasswordRequest;
  }
}
