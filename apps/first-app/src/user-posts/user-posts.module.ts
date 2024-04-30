import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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

const commandHandlers = [
  CreateUserPostHandler,
  UpdateUserPostHandler,
  DeleteUserPostHandler,
];

const queryHandlers = [GetPostByIdHandler];

@Module({
  imports: [
    JwtModule,
    CqrsModule,
    FileResourceModule,
    GuardsModule,
    OrmPrismaModule,
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
