import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserPostResponseDTO } from '@libs/common-types/user-content/controller';

export const GetUserPosts = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get user posts' }),
    ApiBearerAuth(),
    ApiOkResponse({ description: 'User posts', type: [UserPostResponseDTO] }),
    ApiUnauthorizedResponse({
      description: 'You must provide valid access token to access this route',
    }),
  );
};
