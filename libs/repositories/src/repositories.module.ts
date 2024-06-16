import { Module } from '@nestjs/common';
import { PrismaService } from '@libs/repositories/prisma.service';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserProfileRepository } from '@libs/repositories/repos/userProfile.repository';

const queryRepos = [
  UserQueryRepository,
  UserPostsQueryRepository,
  UserProfileQueryRepository,
];

const repos = [UserRepository, UserPostsRepository, UserProfileRepository];

const providers = [PrismaService, ...queryRepos, ...repos];

@Module({
  imports: [],
  providers: providers,
  exports: [...providers],
})
export class RepositoriesModule {}
