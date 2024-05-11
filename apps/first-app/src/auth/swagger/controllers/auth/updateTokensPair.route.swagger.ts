import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseGatewayDTO } from '@libs/common-types/auth/controller';

export const UpdateTokensPairRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update tokens pair' }),
    ApiCreatedResponse({
      description: 'The tokens pair successfully updated',
      type: AccessTokenResponseGatewayDTO,
    }),
    ApiUnauthorizedResponse({
      description:
        'Provide valid refresh token in cookies for update tokens pair',
    }),
    ApiCookieAuth(),
  );
};
