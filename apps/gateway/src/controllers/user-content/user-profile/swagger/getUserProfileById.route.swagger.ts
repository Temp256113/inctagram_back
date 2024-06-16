import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';

export const GetUserProfileById = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user profile by id',
    }),
    ApiOkResponse({
      description: 'User profile found successfully',
      type: UserContentGatewayControllerTypes.ProfileResponseDTO,
    }),
    ApiNotFoundResponse({
      description: 'User profile with provided id is not found',
    }),
  );
};
