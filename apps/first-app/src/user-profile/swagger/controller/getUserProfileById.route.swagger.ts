import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileByIdReturnType } from '../../dto/userProfileReturnTypes';

export const GetUserProfileByIdRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user profile by id',
    }),
    ApiOkResponse({
      description: 'User profile found successfully',
      type: UserProfileByIdReturnType,
    }),
    ApiNotFoundResponse({
      description: 'User profile with provided id is not found',
    }),
    ApiHeader({
      name: 'Authorization',
      description: 'Access token for authentication',
      required: false,
    }),
  );
};
