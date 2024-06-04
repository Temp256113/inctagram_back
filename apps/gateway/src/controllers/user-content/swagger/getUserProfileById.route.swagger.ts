import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileResponseGatewayDTO } from '@libs/common-types/user-content/controller';

export const GetUserProfileById = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user profile by id',
    }),
    ApiOkResponse({
      description: 'User profile found successfully',
      type: UserProfileResponseGatewayDTO,
    }),
    ApiNotFoundResponse({
      description: 'User profile with provided id is not found',
    }),
  );
};
