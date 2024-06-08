import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserPostResponseDTO } from '@libs/common-types/user-content/controller';

export const CreateUserPost = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create user post' }),
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          images: {
            type: 'string',
            format: 'binary',
            description:
              'Few images for new post. Min - 1 image, max - 10 images',
          },
          description: {
            type: 'string',
            description: 'New post description. Optional value',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'New post created',
      type: UserPostResponseDTO,
    }),
    ApiUnauthorizedResponse({
      description: 'You must provide valid access token to access this route',
    }),
  );
};
