import { applyDecorators } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const ResendRegisterEmail = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Resend register email for registration confirm' }),
    ApiNoContentResponse({
      description: 'The email with code for confirm registration has been sent',
    }),
    ApiNotFoundResponse({
      description: 'User with provided email is not found',
    }),
    ApiGoneResponse({
      description: 'User registration is already confirmed',
    }),
  );
};
