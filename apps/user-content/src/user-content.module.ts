import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile/user-profile.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { UpdateUserProfileUsecase } from './user-profile/application/command-handlers';
import { EnvModule } from '@libs/config';
import { JwtTokensModule } from '@libs/jwt-token';
import {
  GetMyProfileUsecase,
  GetProfileByIdUsecase,
} from './user-profile/application/query-handlers';
import { UserPostsController } from './user-posts/user-posts.controller';
import {
  CreatePostUsecase,
  DeletePostUsecase,
  UpdatePostUsecase,
} from './user-posts/application/command-handlers';
import {
  GetMyPostsUsecase,
  GetUserPostByIdUsecase,
} from './user-posts/application/query-handlers';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GoogleDriveService } from './infrastructure/google-drive-storage/googleDrive.service';

const userProfileUsecases = [UpdateUserProfileUsecase];

const userProfileQueryUsecases = [GetMyProfileUsecase, GetProfileByIdUsecase];

const userPostsUsecases = [
  CreatePostUsecase,
  UpdatePostUsecase,
  DeletePostUsecase,
];

const userPostsQueryUsecases = [GetMyPostsUsecase, GetUserPostByIdUsecase];

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
    GoogleDriveService,
    ...userProfileUsecases,
    ...userProfileQueryUsecases,
    ...userPostsUsecases,
    ...userPostsQueryUsecases,
  ],
})
export class UserContentModule {}
