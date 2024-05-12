import { applyDecorators } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PasswordRecoveryCodeCheckResponseTypeSwagger } from '../../../../../first-app/src/auth/dto/passwordRecovery.dto';

export const PasswordRecoveryRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Password recovery' }),
    ApiNoContentResponse({ description: 'Password was changed' }),
    ApiNotFoundResponse({
      description: 'User with provided password recovery code is not found',
    }),
    ApiGoneResponse({
      description: 'Provided password recovery code is expired',
      type: PasswordRecoveryCodeCheckResponseTypeSwagger,
    }),
  );
};
