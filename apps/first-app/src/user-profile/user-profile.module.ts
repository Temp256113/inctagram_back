import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { TokensService } from '../auth/utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { UserProfileQueryRepository } from './repositories/query/user-profile-query.repository';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';
import { PrismaService } from 'shared/database/prisma.service';
import { FileResourceModule } from '../file-resourse/file-resource.module';
import { ProfileImageRepository } from './repositories/profile-image.repository';
import { ProfileImageQueryRepository } from './repositories/query/profile-image-query.repository';
import { CreateUserProfileHandler } from './application/command-handlers/createUserProfile.handler';
import { UpdateUserProfileHandler } from './application/command-handlers/updateUserProfile.handler';
import { GetProfileByIdHandler } from './application/query-handlers/getProfileById.handler';

const commandHandlers = [CreateUserProfileHandler, UpdateUserProfileHandler];

const queryHandlers = [GetProfileByIdHandler];

const repos = [UserProfileRepository, ProfileImageRepository];

const queryRepos = [
  UserProfileQueryRepository,
  UserQueryRepository,
  ProfileImageQueryRepository,
];

@Module({
  imports: [JwtModule, CqrsModule, FileResourceModule],
  controllers: [UserProfileController],
  providers: [
    TokensService,
    PrismaService,
    ...repos,
    ...queryRepos,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class UserProfileModule {}
