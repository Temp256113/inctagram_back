import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import * as CommonTypes from '@libs/common-types/common';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';

export const GetMySubscriptionPayments = () => {
  return applyDecorators(
    ApiOperation({ summary: 'get my subscription payments' }),
    ApiOkResponse({
      description: 'My subscription payments',
      type: PaymentContentGatewayTypes.PaginatorSubscriptionPaymentsOutputDTO,
    }),
  );
};
