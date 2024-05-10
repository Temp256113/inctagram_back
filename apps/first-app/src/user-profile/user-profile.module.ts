import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { FileResourceModule } from '../file-resource/file-resource.module';
import { CreateUserProfileHandler } from './application/command-handlers/createUserProfile.handler';
import { UpdateUserProfileHandler } from './application/command-handlers/updateUserProfile.handler';
import { GetProfileByIdHandler } from './application/query-handlers/getProfileById.handler';
import { JwtTokensModule } from '@libs/jwt-token';
import { RepositoriesModule } from '@libs/repositories/repositories.module';

const commandHandlers = [CreateUserProfileHandler, UpdateUserProfileHandler];

const queryHandlers = [GetProfileByIdHandler];

@Module({
  imports: [
    JwtModule,
    CqrsModule,
    FileResourceModule,
    RepositoriesModule,
    JwtTokensModule,
  ],
  controllers: [UserProfileController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class UserProfileModule {}
