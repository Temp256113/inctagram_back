import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseGatewayDTO } from '@libs/common-types/auth/controller';

export const LoginRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Login' }),
    ApiOkResponse({
      description: 'Successful login',
      type: AccessTokenResponseGatewayDTO,
    }),
    ApiUnauthorizedResponse({
      description: 'The email or password are incorrect. Try again',
    }),
  );
};
