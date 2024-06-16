import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostResponseDTO } from 'libs/common-types/src/user-content/gateway';

export const UpdateUserPost = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update user post' }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'User post was updated',
      type: PostResponseDTO,
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
