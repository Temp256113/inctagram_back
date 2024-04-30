import { Module } from '@nestjs/common';
import { FileResourceService } from './file-resource.service';
import { FileResourseController } from './file-resource.controller';
import { S3StorageAdapter } from '../../../../shared/services/s3StorageAdapter.service';
import { JwtModule } from '@nestjs/jwt';
import { FileResourceRepository } from 'shared/repositories/file-resourse.repository';
import { FileResourceQueryRepository } from 'shared/repositories/query/file-resource-query.repository';
import { GuardsModule } from '../../../../shared/guards/guards.module';
import { OrmPrismaModule } from '@libs/orm-prisma-service';

@Module({
  imports: [JwtModule, GuardsModule, OrmPrismaModule],
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
