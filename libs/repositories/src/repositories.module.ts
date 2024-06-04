import { Module } from '@nestjs/common';
import { PrismaService } from '@libs/repositories/prisma.service';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { FileResourceQueryRepository } from '@libs/repositories/query-repos/fileResource.queryRepository';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';
import { FileResourceRepository } from '@libs/repositories/repos/fileResource.repository';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserProfileRepository } from '@libs/repositories/repos/userProfile.repository';
import { EventEmitterModule } from '@nestjs/event-emitter';

const modules = [
  EventEmitterModule.forRoot({
    delimiter: '.',
    wildcard: true,
    ignoreErrors: true,
  }),
];

const queryRepos = [
  FileResourceQueryRepository,
  UserQueryRepository,
  UserPostsQueryRepository,
  UserProfileQueryRepository,
];

const repos = [
  FileResourceRepository,
  UserRepository,
  UserPostsRepository,
  UserProfileRepository,
];

const providers = [PrismaService, ...queryRepos, ...repos];

@Module({
  imports: modules,
  providers: providers,
  exports: [...providers, ...modules],
})
export class RepositoriesModule {}
