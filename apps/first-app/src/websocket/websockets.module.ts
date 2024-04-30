import { Module } from '@nestjs/common';
import { UserPostsQueryRepository } from '../user-posts/repositories/userPosts.queryRepository';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';
import { WebsocketsMainPageService } from './main-page/websocketsMainPage.service';
import { OrmPrismaModule } from '@libs/orm-prisma';

const queryRepositories = [UserPostsQueryRepository, UserQueryRepository];

@Module({
  imports: [OrmPrismaModule],
  providers: [WebsocketsMainPageService, ...queryRepositories],
  exports: [],
})
export class WebsocketsModule {}
