import { Module } from '@nestjs/common';
import { PrismaService } from '@libs/orm-prisma-service/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class OrmPrismaModule {}
