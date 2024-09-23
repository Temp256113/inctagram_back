import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { StripeAdapter } from 'libs/infrastructure/stripe/stripe-adapter';
import Stripe from 'stripe';

export class PurchasingSubscriptionCommand {
  constructor(
    public readonly data: PaymentContentMicroserviceTypes.purchasingSubscriptionDTO,
  ) {}
}

@CommandHandler(PurchasingSubscriptionCommand)
export class PurchasingSubscriptionHandler
  implements ICommandHandler<PurchasingSubscriptionCommand>
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly stripeAdapter: StripeAdapter,
  ) {}

  async execute({
    data: command,
  }: PurchasingSubscriptionCommand): Promise<string> {
    const result = await this.stripeAdapter.createSession('1');
    console.log(result);

    return result.url;
  }
}
