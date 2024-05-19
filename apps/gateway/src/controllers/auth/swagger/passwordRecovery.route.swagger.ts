import { applyDecorators } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PasswordRecoveryCodeCheckErrorType } from '../../../../../auth/src/application/command-handlers/common/passwordRecoveryCodeCheckUtils';

export const PasswordRecovery = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Password recovery' }),
    ApiNoContentResponse({ description: 'Password was changed' }),
    ApiNotFoundResponse({
      description: 'User with provided password recovery code is not found',
    }),
    ApiGoneResponse({
      description: 'Provided password recovery code is expired',
      type: PasswordRecoveryCodeCheckErrorType,
    }),
  );
};
