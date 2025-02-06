import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { EnvModule } from '@libs/config';
import { PaymentController } from './payment.controller';
import { JwtTokensModule } from '@libs/jwt-token';
import * as Commands from './application/command-handlers/index';
import * as Queries from './application/query-handlers/index';
import { PaymentService } from './payment.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentManager } from 'libs/infrastructure/paymentManager';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';
import { PaypalAdapter } from 'libs/infrastructure/paypal/paypal-adapter';

const useCases = [
  Commands.PurchasingSubscriptionUseCase,
  Commands.StripeWebhookHandler,
  Commands.PaypalSuccessHandler,
  Commands.PaypalSubscriptionWebhookHandler,
  Commands.PaypalPaymentWebhookHandler,
  Queries.GetMySubscriptionPaymentsUsecase,
];

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EnvModule,
    CqrsModule,
    RepositoriesModule,
    JwtTokensModule,
  ],
  controllers: [PaymentController],
  providers: [
    ...useCases,
    PaymentManager,
    StripeAdapter,
    PaypalAdapter,
    PaymentService,
  ],
})
export class PaymentModule {}
