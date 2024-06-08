import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { UserPostReturnType } from '../../dto/userPostReturnTypes';

export const GetUserPostsRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get user posts' }),
    ApiBearerAuth(),
    // ApiOkResponse({ description: 'User posts', type: [UserPostReturnType] }),
    ApiUnauthorizedResponse({
      description: 'You must provide valid access token to access this route',
    }),
  );
};
