import { applyDecorators } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { RegisterCodeCheckResponseTypeSwagger } from '../../../dto/register.dto';

export const RegisterCodeCheckRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Check register code from email link',
      description: 'You need provide code from link on email message',
    }),
    ApiNoContentResponse({ description: 'User email is confirmed' }),
    ApiNotFoundResponse({
      description: 'User with provided code is not found',
    }),
    ApiGoneResponse({
      description: 'Provided code is expired',
      type: RegisterCodeCheckResponseTypeSwagger,
    }),
  );
};
