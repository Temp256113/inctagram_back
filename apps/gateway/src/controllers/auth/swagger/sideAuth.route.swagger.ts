import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseGatewayDTO } from '@libs/common-types/auth/controller';

export const SideAuth = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Auth via side decisions' }),
    ApiOkResponse({
      description: 'Successful login/registration',
      type: AccessTokenResponseGatewayDTO,
    }),
    ApiBadRequestResponse({
      description: 'Provided incorrect auth code',
    }),
    ApiUnauthorizedResponse({
      description: 'Provided invalid auth code',
    }),
  );
};
