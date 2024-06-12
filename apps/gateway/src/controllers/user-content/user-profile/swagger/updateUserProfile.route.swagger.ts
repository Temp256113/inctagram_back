import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileResponseGatewayDTO } from 'libs/common-types/src/user-content/gateway';

export const UpdateUserProfile = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Update user profile`,
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          profileImage: {
            type: 'string',
            format: 'binary',
            description: 'New image for your profile',
          },
          username: {
            type: 'string',
            example: 'temp256113',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          dateOfBirth: {
            type: 'string',
            example: '2020-02-03T09:19:30.434Z',
          },
          country: {
            type: 'string',
            example: 'Russia',
          },
          city: {
            type: 'string',
            example: 'London',
          },
          aboutMe: {
            type: 'string',
            example: 'Info',
          },
        },
      },
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
