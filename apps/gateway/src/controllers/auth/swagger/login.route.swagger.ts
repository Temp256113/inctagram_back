import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';

export const Login = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Login' }),
    ApiOkResponse({
      description: 'Successful login',
      type: AuthGatewayControllerTypes.LoginResponseDTO,
    }),
    ApiUnauthorizedResponse({
      description: 'The email or password are incorrect. Try again',
    }),
  );
};
