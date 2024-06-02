import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileResponseGatewayDTO } from '@libs/common-types/user-content/controller';

export const GetUserProfile = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Get user profile`,
    }),
    ApiOkResponse({
      description: `User profile found successfully`,
      type: UserProfileResponseGatewayDTO,
    }),
    ApiBadRequestResponse({
      description: 'Something went wrong',
      schema: {
        example: {
          message: 'Something went wrong',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiBearerAuth(),
  );
};
