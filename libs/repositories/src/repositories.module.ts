import { Module } from '@nestjs/common';
import { PrismaService } from '@libs/repositories/prisma.service';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { FileResourceQueryRepository } from '@libs/repositories/query-repos/fileResource.queryRepository';
import { ProfileImageQueryRepository } from '@libs/repositories/query-repos/profileImage.queryRepository';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';
import { FileResourceRepository } from '@libs/repositories/repos/fileResource.repository';
import { ProfileImageRepository } from '@libs/repositories/repos/profileImage.repository';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserProfileRepository } from '@libs/repositories/repos/userProfile.repository';

const queryRepos = [
  FileResourceQueryRepository,
  ProfileImageQueryRepository,
  UserQueryRepository,
  UserPostsQueryRepository,
  UserProfileQueryRepository,
];

const repos = [
  FileResourceRepository,
  ProfileImageRepository,
  UserRepository,
  UserPostsRepository,
  UserProfileRepository,
];

const toExport = [PrismaService, ...queryRepos, ...repos];

@Module({
  providers: toExport,
  exports: toExport,
})
export class RepositoriesModule {}
