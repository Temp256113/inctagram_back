import { Module } from '@nestjs/common';
import { UserPostsQueryRepository } from '../user-posts/repositories/userPosts.queryRepository';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';
import { WebsocketsMainPageEvents } from './main-page/websocketsMainPage.events';
import { WebsocketsMainPageStateService } from './main-page/websockets.mainPageState.service';

const queryRepositories = [UserPostsQueryRepository, UserQueryRepository];

const mainPage = [WebsocketsMainPageStateService, WebsocketsMainPageEvents];

@Module({
  providers: [...mainPage, ...queryRepositories, PrismaService],
  exports: [],
})
export class WebsocketsModule {}
