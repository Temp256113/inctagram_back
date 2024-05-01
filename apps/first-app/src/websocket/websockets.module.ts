import { Module } from '@nestjs/common';
import { WebsocketsMainPageService } from './main-page/websocketsMainPage.service';
import { RepositoriesModule } from '@libs/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [WebsocketsMainPageService],
  exports: [],
})
export class WebsocketsModule {}
