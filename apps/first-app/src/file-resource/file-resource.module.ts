import { Module } from '@nestjs/common';
import { CommonGuardsModule } from '@libs/common-guards';
import { FileResourceService } from './file-resource.service';
import { FileResourseController } from './file-resource.controller';
import { S3StorageAdapter } from './s3StorageAdapter.service';
import { RepositoriesModule } from '@libs/repositories/repositories.module';

@Module({
  imports: [CommonGuardsModule, RepositoriesModule],
  controllers: [FileResourseController],
  providers: [FileResourceService, S3StorageAdapter],
  exports: [FileResourceService],
})
export class FileResourceModule {}
