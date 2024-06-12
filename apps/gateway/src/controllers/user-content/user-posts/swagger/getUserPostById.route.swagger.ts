import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PostResponseDTO } from 'libs/common-types/src/user-content/gateway';

export const GetPostById = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user post by id',
    }),
    ApiOkResponse({
      description: 'User post found successfully',
      type: PostResponseDTO,
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
