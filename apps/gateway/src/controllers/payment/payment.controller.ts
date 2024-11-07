import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  RawBodyRequest,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import * as PaymentGatewayTypes from '@libs/common-types/payment/gateway';
import * as SwaggerRouteDecorators from './swagger';
import { PaymentMicroservicePatterns } from '@libs/microservice-patterns';
import * as CommonTypes from '@libs/common-types/common';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';
import { AccessTokenGuard } from '../../guards/accessToken.guard';
import { AccessTokenUserType } from '@libs/common-types/guards/accessToken.guard.types';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { User } from '../../decorators/user.decorator';

import 'dotenv/config';

@Controller('payment')
@ApiTags('payment controller')
export class PaymentController {
  constructor(@Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy) {}

  @Post('stripe/webhook')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<void> {
    const stripeWebhookPayload = {
      signature: req.headers['stripe-signature'],
      rawBody: req.rawBody,
    };

    await this.paymentClient.emit(
      PaymentMicroservicePatterns.STRIPE_WEBHOOK,
      stripeWebhookPayload,
    );

    return;
  }

  @Post('paypal/webhook')
  async paypalWebhook(@Req() request): Promise<void> {
    const paypalWebhookPayload: PaymentContentMicroserviceTypes.PaypalWebhookDTO =
      {
        eventType: request.body.event_type,
        id:
          request.body.event_type === 'PAYMENT.SALE.COMPLETED'
            ? request.body.resource.billing_agreement_id
            : request.body.resource.id,
        paymentData:
          request.body.event_type === 'PAYMENT.SALE.COMPLETED'
            ? request.body.resource.update_time
            : '',
        data: request.body,
      };

    await this.paymentClient.emit(
      PaymentMicroservicePatterns.PAYPAL_WEBHOOK,
      paypalWebhookPayload,
    );

    return;
  }

  @Get('paypal/success')
  @Redirect(process.env.FRONTEND_SUCCESS_PAYMENT_URL)
  async paypalSuccess(
    @Query() query: PaymentGatewayTypes.PaypalSuccessQuery,
  ): Promise<string> {
    this.paymentClient.emit(PaymentMicroservicePatterns.PAYPAL_SUCCESS, query);

    return 'success';
  }

  @Post('purchasingSubscription')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.PurchasingSubscription()
  async purchasingSubscription(
    @Body() dto: PaymentGatewayTypes.PurchasingSubscriptionDTO,
    @User() user: AccessTokenUserType,
  ): Promise<PaymentContentGatewayTypes.PurchasingSubscriptionOutputDTO> {
    const purchasingSubscriptionPayload: PaymentContentMicroserviceTypes.PurchasingSubscriptionDTO =
      {
        autoRenewal: dto.autoRenewal,
        paymentMethod: dto.paymentMethod,
        subscriptionType: dto.subscriptionType,
        userId: user.id,
      };
    const result: PaymentContentGatewayTypes.PurchasingSubscriptionOutputDTO =
      await lastValueFrom(
        this.paymentClient.send(
          PaymentMicroservicePatterns.PURCHASING_SUBSCRIPTION,
          purchasingSubscriptionPayload,
        ),
      );

    return result;
  }

  @Get('mySubscriptionPayments')
  @UseGuards(AccessTokenGuard)
  async getMySubscriptionPayments(
    @Query() query: CommonTypes.QueryFilter,
    @User() user: AccessTokenUserType,
  ): Promise<
    CommonTypes.Paginator<PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO>
  > {
    const getgetMySubscriptionPaymentsPayload: PaymentContentMicroserviceTypes.GetSubscriptionPayments =
      {
        userId: user.id,
        queryParams: query,
      };
    const result: CommonTypes.Paginator<PaymentContentGatewayTypes.SubscriptionPaymentsOutputDTO> =
      await lastValueFrom(
        this.paymentClient.send(
          PaymentMicroservicePatterns.GET_MY_SUBSCRIPTION_PAYMENTS,
          getgetMySubscriptionPaymentsPayload,
        ),
      );
    return result;
  }
}
