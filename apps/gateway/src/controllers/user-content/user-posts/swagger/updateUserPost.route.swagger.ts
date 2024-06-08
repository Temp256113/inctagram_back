import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { UserPostReturnType } from '../../dto/userPostReturnTypes';

export const UpdateUserPostRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update user post' }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'User post was updated',
      // type: UserPostReturnType,
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
