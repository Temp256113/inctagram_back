import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { TokensService } from '../auth/utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { UserProfileQueryRepository } from './repositories/query/user-profile-query.repository';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserProfileHandler } from './application/commandHandlers/userProfile/createUserProfile.handler';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';
import { UpdateUserProfileHandler } from './application/commandHandlers/userProfile/updateUserProfile.handler';
import { PrismaService } from 'shared/database/prisma.service';
import { FileResourceModule } from '../file-resourse/file-resource.module';
import { ProfileImageRepository } from './repositories/profile-image.repository';
import { ProfileImageQueryRepository } from './repositories/query/profile-image-query.repository';

const commandHandlers = [CreateUserProfileHandler, UpdateUserProfileHandler];

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
  ],
})
export class UserProfileModule {}
