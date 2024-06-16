import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { MainPageEventsService } from './mainPageEvents.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [WebhooksController],
  providers: [MainPageEventsService],
})
export class WebhooksModule {}
