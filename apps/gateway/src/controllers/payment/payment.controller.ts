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

@Controller('payment')
@ApiTags('payment controller')
export class PaymentController {
  constructor(@Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy) {}

  @Post('stripe/webhook')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<void> {
    console.log('webhook Stripe');

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
