import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const Register = () => {
  return applyDecorators(
    ApiOperation({ summary: 'New user register' }),
    ApiCreatedResponse({
      description: 'The user has been successfully created',
    }),
    ApiConflictResponse({
      description:
        'The user with provided username or email already registered',
    }),
  );
};
