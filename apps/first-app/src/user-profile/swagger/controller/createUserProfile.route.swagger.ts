import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileReturnType } from '../../dto/userProfileReturnTypes';

export const CreateUserProfileRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Create user profile`,
    }),
    ApiOkResponse({
      description: `User profile create successfully`,
      type: UserProfileReturnType,
    }),
    ApiBadRequestResponse({
      description: 'Something went wrong',
      schema: {
        example: {
          message: 'Username already exists',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiBearerAuth(),
  );
};
