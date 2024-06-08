import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile/user-profile.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { UpdateUserProfileHandler } from './user-profile/application/command-handlers';
import { S3StorageService } from './infrastructure/s3-storage/s3Storage.service';
import { S3StorageAdapter } from './infrastructure/s3-storage/s3Storage.adapter';
import { EnvModule } from '@libs/config';
import { JwtTokensModule } from '@libs/jwt-token';
import {
  GetMyUserProfileHandler,
  GetUserProfileByIdHandler,
} from './user-profile/application/query-handlers';
import { UserPostsController } from './user-posts/user-posts.controller';
import { CreateUserPostHandler } from './user-posts/application/command-handlers/createUserPost.handler';

const userProfileHandlers = [UpdateUserProfileHandler];

const userProfileQueryHandlers = [
  GetMyUserProfileHandler,
  GetUserProfileByIdHandler,
];

const userPostsHandlers = [CreateUserPostHandler];

@Module({
  imports: [CqrsModule, RepositoriesModule, EnvModule, JwtTokensModule],
  controllers: [UserProfileController, UserPostsController],
  providers: [
    S3StorageService,
    S3StorageAdapter,
    ...userProfileHandlers,
    ...userProfileQueryHandlers,
    ...userPostsHandlers,
  ],
})
export class UserContentModule {}
