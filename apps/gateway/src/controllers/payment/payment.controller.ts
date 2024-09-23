import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import * as AuthMicroserviceTypes from '@libs/common-types/auth/microservice';
import * as PaymentGatewayTypes from '@libs/common-types/payment/gateway';
// import * as SwaggerRouteDecorators from './swagger';
import { PaymentMicroservicePatterns } from '@libs/microservice-patterns';
import * as PaymentContentGatewayTypes from '@libs/common-types/payment/gateway';

@Controller('payment')
@ApiTags('payment controller')
export class PaymentController {
  constructor(@Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy) {}

  @Post('stripe/webhook')
  // @HttpCode(HttpStatus.OK)
  // @SwaggerRouteDecorators.SideAuth()
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
  @HttpCode(HttpStatus.OK)
  // @SwaggerRouteDecorators.SideAuth()
  async purchasingSubscription(
    @Body() dto: PaymentGatewayTypes.purchasingSubscriptionDTO,
  ): Promise<PaymentContentGatewayTypes.purchasingSubscriptionOutputDTO> {
    const result: PaymentContentGatewayTypes.purchasingSubscriptionOutputDTO =
      await lastValueFrom(
        this.paymentClient.send(
          PaymentMicroservicePatterns.PURCHASING_SUBSCRIPTION,
          dto,
        ),
      );

    return result;
  }
}
