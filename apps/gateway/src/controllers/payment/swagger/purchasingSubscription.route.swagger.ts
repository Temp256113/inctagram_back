import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const PurchasingSubscription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'purchasing a subscription for a account' }),
    ApiOkResponse({
      description: 'Purchase link created',
    }),
    // ApiConflictResponse({
    //   description:
    //     'The user with provided username or email already registered',
    // }),
  );
};
