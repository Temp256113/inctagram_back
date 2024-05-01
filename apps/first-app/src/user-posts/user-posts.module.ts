import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserPostsController } from './user-posts.controller';
import { FileResourceModule } from '../file-resource/file-resource.module';
import { CommonGuardsModule } from '@libs/common-guards';
import { GetPostByIdHandler } from './application/query-handlers/getPostById.handler';
import { CreateUserPostHandler } from './application/command-handlers/createUserPost.handler';
import { UpdateUserPostHandler } from './application/command-handlers/updateUserPost.handler';
import { DeleteUserPostHandler } from './application/command-handlers/deleteUserPost.handler';
import { JwtTokenModule } from '@libs/jwt-token';
import { RepositoriesModule } from '@libs/repositories/repositories.module';

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
    CommonGuardsModule,
    RepositoriesModule,
    JwtTokenModule,
  ],
  controllers: [UserPostsController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class UserPostsModule {}
