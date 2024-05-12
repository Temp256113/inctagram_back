import { applyDecorators } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PasswordRecoveryCodeCheckErrorType } from '../../../../../auth/src/application/command-handlers/common/passwordRecoveryCodeCheckFunction';

export const PasswordRecoveryCodeCheckRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Password recovery code check' }),
    ApiNoContentResponse({ description: 'Code is valid' }),
    ApiNotFoundResponse({
      description: 'Change password request is not found',
    }),
    ApiGoneResponse({
      description: 'Provided password recovery code is expired',
      type: PasswordRecoveryCodeCheckErrorType,
    }),
  );
};
