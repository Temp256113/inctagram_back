import { Module } from '@nestjs/common';
import { UserPostsQueryRepository } from '../user-posts/repositories/userPosts.queryRepository';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';
import { WebsocketsMainPageService } from './main-page/websocketsMainPage.service';

const queryRepositories = [UserPostsQueryRepository, UserQueryRepository];

@Module({
  providers: [WebsocketsMainPageService, ...queryRepositories, PrismaService],
  exports: [],
})
export class WebsocketsModule {}
