import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { EnvModule } from '@libs/config';
import { PaymentController } from './payment.controller';
import { JwtTokensModule } from '@libs/jwt-token';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';
import * as Commands from './application/command-handlers/index';
import * as Queries from './application/query-handlers/index';

const useCases = [
  Commands.PurchasingSubscriptionUseCase,
  Commands.StripeWebhookHandler,
  Queries.GetMySubscriptionPaymentsUsecase,
];

@Module({
  imports: [EnvModule, CqrsModule, RepositoriesModule, JwtTokensModule],
  controllers: [PaymentController],
  providers: [...useCases, StripeAdapter],
})
export class PaymentModule {}
