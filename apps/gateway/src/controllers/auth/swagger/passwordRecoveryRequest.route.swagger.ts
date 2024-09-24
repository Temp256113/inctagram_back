import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const PasswordRecoveryRequest = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Password recovery request' }),
    ApiNoContentResponse({
      description: 'Password recovery code sent to email',
    }),
    ApiNotFoundResponse({
      description: 'Not found user with provided userId or email',
    }),
  );
};
