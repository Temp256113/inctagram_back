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
  GetMyProfileHandler,
  GetProfileByIdHandler,
} from './user-profile/application/query-handlers';
import { UserPostsController } from './user-posts/user-posts.controller';
import {
  CreatePostHandler,
  DeletePostHandler,
  UpdatePostHandler,
} from './user-posts/application/command-handlers';
import {
  GetMyPostsHandler,
  GetUserPostByIdHandler,
} from './user-posts/application/query-handlers';
import { ClientsModule, Transport } from '@nestjs/microservices';

const userProfileHandlers = [UpdateUserProfileHandler];

const userProfileQueryHandlers = [GetMyProfileHandler, GetProfileByIdHandler];

const userPostsHandlers = [
  CreatePostHandler,
  UpdatePostHandler,
  DeletePostHandler,
];

const userPostsQueryHandlers = [GetMyPostsHandler, GetUserPostByIdHandler];

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'WEBHOOKS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'webhooks_queue',
        },
      },
    ]),
    CqrsModule,
    RepositoriesModule,
    EnvModule,
    JwtTokensModule,
  ],
  controllers: [UserProfileController, UserPostsController],
  providers: [
    S3StorageService,
    S3StorageAdapter,
    ...userProfileHandlers,
    ...userProfileQueryHandlers,
    ...userPostsHandlers,
    ...userPostsQueryHandlers,
  ],
})
export class UserContentModule {}
