import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserPostsController } from './user-posts.controller';
import { FileResourceModule } from '../file-resource/file-resource.module';
import { UserPostsRepository } from './repositories/userPosts.repository';
import { UserPostsQueryRepository } from './repositories/userPosts.queryRepository';
import { GuardsModule } from '../../../../shared/guards/guards.module';
import { GetPostByIdHandler } from './application/query-handlers/getPostById.handler';
import { CreateUserPostHandler } from './application/command-handlers/createUserPost.handler';
import { UpdateUserPostHandler } from './application/command-handlers/updateUserPost.handler';
import { DeleteUserPostHandler } from './application/command-handlers/deleteUserPost.handler';
import { OrmPrismaModule } from '@libs/orm-prisma';
import { JwtTokenModule } from '@libs/jwt-token';

const commandHandlers = [
  CreateUserPostHandler,
  UpdateUserPostHandler,
  DeleteUserPostHandler,
];

const queryHandlers = [GetPostByIdHandler];

@Module({
  imports: [
    CqrsModule,
    FileResourceModule,
    GuardsModule,
    OrmPrismaModule,
    JwtTokenModule,
  ],
  controllers: [UserPostsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    UserPostsRepository,
    UserPostsQueryRepository,
  ],
})
export class UserPostsModule {}
