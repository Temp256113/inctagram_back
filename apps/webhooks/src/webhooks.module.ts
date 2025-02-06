import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { MainPageEventsService } from './mainPageEvents.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { EnvModule } from '@libs/config';

@Module({
  imports: [ScheduleModule.forRoot(), RepositoriesModule, EnvModule],
  controllers: [WebhooksController],
  providers: [MainPageEventsService],
})
export class WebhooksModule {}
