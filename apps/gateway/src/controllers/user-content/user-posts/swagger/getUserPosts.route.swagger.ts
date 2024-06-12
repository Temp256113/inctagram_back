import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostResponseDTO } from 'libs/common-types/src/user-content/gateway';

export const GetMyPosts = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get user posts' }),
    ApiBearerAuth(),
    ApiOkResponse({ description: 'User posts', type: [PostResponseDTO] }),
    ApiUnauthorizedResponse({
      description: 'You must provide valid access token to access this route',
    }),
  );
};
