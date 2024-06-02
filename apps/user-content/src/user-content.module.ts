import { Module } from '@nestjs/common';
import { UserContentController } from './user-content.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';

@Module({
  imports: [CqrsModule, RepositoriesModule],
  controllers: [UserContentController],
  providers: [],
})
export class UserContentModule {}
