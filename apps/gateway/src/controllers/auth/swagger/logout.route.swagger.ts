import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const LogoutRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Logout' }),
    ApiNoContentResponse({ description: 'Logout success' }),
    ApiUnauthorizedResponse({
      description: 'Logout failed. Provide valid refresh token for logout',
    }),
    ApiCookieAuth(),
  );
};
