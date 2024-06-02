import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginResponseGatewayDTO } from '@libs/common-types/auth/controller';

export const UpdateTokensPair = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update tokens pair' }),
    ApiCreatedResponse({
      description: 'The tokens pair successfully updated',
      type: LoginResponseGatewayDTO,
    }),
    ApiUnauthorizedResponse({
      description:
        'Provide valid refresh token in cookies for update tokens pair',
    }),
    ApiCookieAuth(),
  );
};
