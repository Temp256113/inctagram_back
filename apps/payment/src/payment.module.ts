import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { EnvModule } from '@libs/config';
import { PaymentController } from './payment.controller';
import { StripeWebhookHandler } from './application/command-handlers';
import { JwtTokensModule } from '@libs/jwt-token';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';
import { PurchasingSubscriptionHandler } from './application/command-handlers/purchasingSubscription.handler';

const commandHandlers = [StripeWebhookHandler, PurchasingSubscriptionHandler];

@Module({
  imports: [EnvModule, CqrsModule, RepositoriesModule, JwtTokensModule],
  controllers: [PaymentController],
  providers: [PaymentService, ...commandHandlers, StripeAdapter],
})
export class PaymentModule {}
