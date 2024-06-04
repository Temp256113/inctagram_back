import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileResponseGatewayDTO } from '@libs/common-types/user-content/controller';

export const UpdateUserProfile = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Update user profile`,
    }),
    ApiOkResponse({
      description: `User profile update successfully`,
      type: UserProfileResponseGatewayDTO,
    }),
    ApiForbiddenResponse({
      description: 'Something went wrong',
      schema: {
        example: {
          message: 'Username already exists or user age is under 13',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiBearerAuth(),
  );
};
