import { Module } from '@nestjs/common';
import { GuardsModule } from '../../../../shared/guards/guards.module';
import { FileResourceService } from './file-resource.service';
import { FileResourseController } from './file-resource.controller';
import { S3StorageAdapter } from '../../../../shared/services/s3StorageAdapter.service';
import { FileResourceRepository } from 'shared/repositories/file-resourse.repository';
import { FileResourceQueryRepository } from 'shared/repositories/query/file-resource-query.repository';
import { OrmPrismaModule } from '@libs/orm-prisma';

@Module({
  imports: [GuardsModule, OrmPrismaModule],
  controllers: [FileResourseController],
  providers: [
    FileResourceService,
    S3StorageAdapter,
    FileResourceRepository,
    FileResourceQueryRepository,
  ],
  exports: [FileResourceService],
})
export class FileResourceModule {}
