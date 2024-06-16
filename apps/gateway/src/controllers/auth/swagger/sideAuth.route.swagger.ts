import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';

export const SideAuth = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Auth via side decisions' }),
    ApiOkResponse({
      description: 'Successful login/registration',
      type: AuthGatewayControllerTypes.LoginResponseDTO,
    }),
    ApiBadRequestResponse({
      description: 'Provided incorrect auth code',
    }),
    ApiUnauthorizedResponse({
      description: 'Provided invalid auth code',
    }),
  );
};
