import { Module } from '@nestjs/common';
import { WebsocketMainPageEvents } from './websocketsMainPage.events';
import { UserPostsQueryRepository } from '../user-posts/repositories/userPosts.queryRepository';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';

const queryRepositories = [UserPostsQueryRepository, UserQueryRepository];

@Module({
  providers: [WebsocketMainPageEvents, PrismaService, ...queryRepositories],
  exports: [],
})
export class WebsocketsModule {}
