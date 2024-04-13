import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserPostsController } from './user-posts.controller';
import { CreateUserPostHandler } from './application/createUserPost.handler';
import { FileResourceModule } from '../file-resourse/file-resource.module';
import { UserPostsRepository } from './repositories/userPosts.repository';
import { UpdateUserPostHandler } from './application/updateUserPost.handler';
import { UserPostsQueryRepository } from './repositories/userPosts.queryRepository';
import { DeleteUserPostHandler } from './application/deleteUserPost.handler';
import { GuardsModule } from '../../../../shared/guards/guards.module';

const commandHandlers = [
  CreateUserPostHandler,
  UpdateUserPostHandler,
  DeleteUserPostHandler,
];

@Module({
  imports: [JwtModule, CqrsModule, FileResourceModule, GuardsModule],
  controllers: [UserPostsController],
  providers: [
    PrismaService,
    ...commandHandlers,
    UserPostsRepository,
    UserPostsQueryRepository,
  ],
})
export class UserPostsModule {}
