import { Controller } from '@nestjs/common';
import { MainPageEventsService } from './mainPageEvents.service';
import { EventPattern } from '@nestjs/microservices';
import { WebhooksMicroservicePatterns } from '@libs/microservice-patterns';

@Controller()
export class WebhooksController {
  constructor(private readonly mainPageEventsService: MainPageEventsService) {}

  @EventPattern(WebhooksMicroservicePatterns.REGISTER_USER_EVENT)
  registerUserHandleEvent(): void {
    this.mainPageEventsService.increaseRegisteredUsersAmount();
  }

  @EventPattern(WebhooksMicroservicePatterns.CREATE_POST_EVENT)
  createPostHandleEvent(): void {
    this.mainPageEventsService.increaseNewCreatedPostsAmount();
  }
}
