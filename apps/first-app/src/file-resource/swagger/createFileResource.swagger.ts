import { HttpStatus, applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileResourceSwaggerType } from './type/fileResource.swagger-type';

export const CreateFileResourceRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Create upload file`,
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
          type: {
            type: 'string',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `File resource created`,
      type: FileResourceSwaggerType,
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Validation error',
    }),
  );
};
