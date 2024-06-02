import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginResponseGatewayDTO } from '@libs/common-types/auth/controller';

export const Login = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Login' }),
    ApiOkResponse({
      description: 'Successful login',
      type: LoginResponseGatewayDTO,
    }),
    ApiUnauthorizedResponse({
      description: 'The email or password are incorrect. Try again',
    }),
  );
};
