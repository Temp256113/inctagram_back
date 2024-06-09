import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserPostResponseDTO } from '@libs/common-types/user-content/controller';

export const GetUserPostById = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user post by id',
    }),
    ApiOkResponse({
      description: 'User post found successfully',
      type: UserPostResponseDTO,
    }),
    ApiNotFoundResponse({
      description: 'User post with provided id is not found',
    }),
    ApiHeader({
      name: 'Authorization',
      description: 'Access token for authentication',
      required: false,
    }),
  );
};
