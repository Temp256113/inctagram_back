import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserProfileQueryRepository } from './repositories/query/user-profile-query.repository';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';
import { FileResourceModule } from '../file-resource/file-resource.module';
import { ProfileImageRepository } from './repositories/profile-image.repository';
import { ProfileImageQueryRepository } from './repositories/query/profile-image-query.repository';
import { CreateUserProfileHandler } from './application/command-handlers/createUserProfile.handler';
import { UpdateUserProfileHandler } from './application/command-handlers/updateUserProfile.handler';
import { GetProfileByIdHandler } from './application/query-handlers/getProfileById.handler';
import { OrmPrismaModule } from '@libs/orm-prisma';
import { JwtTokenModule } from '@libs/jwt-token';

const commandHandlers = [CreateUserProfileHandler, UpdateUserProfileHandler];

const queryHandlers = [GetProfileByIdHandler];

const repos = [UserProfileRepository, ProfileImageRepository];

const queryRepos = [
  UserProfileQueryRepository,
  UserQueryRepository,
  ProfileImageQueryRepository,
];

@Module({
  imports: [
    JwtModule,
    CqrsModule,
    FileResourceModule,
    OrmPrismaModule,
    JwtTokenModule,
  ],
  controllers: [UserProfileController],
  providers: [...repos, ...queryRepos, ...commandHandlers, ...queryHandlers],
})
export class UserProfileModule {}
