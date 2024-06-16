import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { MainPageEventsService } from './mainPageEvents.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RepositoriesModule } from '@libs/repositories/repositories.module';

@Module({
  imports: [ScheduleModule.forRoot(), RepositoriesModule],
  controllers: [WebhooksController],
  providers: [MainPageEventsService],
})
export class WebhooksModule {}
