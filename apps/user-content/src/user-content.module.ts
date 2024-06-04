import { Module } from '@nestjs/common';
import { UserContentController } from './user-content.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { UpdateUserProfileHandler } from './application/command-handlers';
import { S3StorageService } from './infrastructure/s3-storage/s3Storage.service';
import { S3StorageAdapter } from './infrastructure/s3-storage/s3Storage.adapter';
import { EnvModule } from '@libs/config';
import { JwtTokensModule } from '@libs/jwt-token';

const userProfileHandlers = [UpdateUserProfileHandler];

@Module({
  imports: [CqrsModule, RepositoriesModule, EnvModule, JwtTokensModule],
  controllers: [UserContentController],
  providers: [S3StorageService, S3StorageAdapter, ...userProfileHandlers],
})
export class UserContentModule {}
