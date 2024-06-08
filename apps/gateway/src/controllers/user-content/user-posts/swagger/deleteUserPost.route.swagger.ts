import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const DeleteUserPostRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user post' }),
    ApiBearerAuth(),
    ApiNoContentResponse({
      description: 'User post with provided id is deleted',
    }),
    ApiUnauthorizedResponse({
      description: 'You must provide valid access token to access this route',
    }),
    ApiNotFoundResponse({
      description: 'Not found user post with provided id',
    }),
    ApiForbiddenResponse({
      description: 'The user post with the provided id does not belong to you',
    }),
  );
};
