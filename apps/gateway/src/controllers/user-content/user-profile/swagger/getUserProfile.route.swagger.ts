import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';

export const GetUserProfile = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Get user profile`,
    }),
    ApiOkResponse({
      description: `User profile found successfully`,
      type: UserContentGatewayControllerTypes.ProfileResponseDTO,
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
