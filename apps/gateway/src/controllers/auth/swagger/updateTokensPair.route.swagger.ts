import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';

export const UpdateTokensPair = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update tokens pair' }),
    ApiCreatedResponse({
      description: 'The tokens pair successfully updated',
      type: AuthGatewayControllerTypes.LoginResponseDTO,
    }),
    ApiUnauthorizedResponse({
      description:
        'Provide valid refresh token in cookies for update tokens pair',
    }),
    ApiCookieAuth(),
  );
};
