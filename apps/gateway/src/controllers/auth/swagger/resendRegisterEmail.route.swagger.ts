import { applyDecorators } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const ResendRegisterEmailRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Resend register email for registration confirm' }),
    ApiNoContentResponse({ description: 'The email has been sent' }),
    ApiNotFoundResponse({
      description: 'User with provided email is not found',
    }),
    ApiGoneResponse({
      description: 'User email is already confirmed',
    }),
  );
};
