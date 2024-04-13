import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserQueryRepository } from '../../apps/first-app/src/auth/repositories/query/user.queryRepository';
import { TokensService } from '../../apps/first-app/src/auth/utils/tokens.service';
import { PrismaService } from '../database/prisma.service';
import { EnvModule } from '../config/config.module';
import { JwtModule } from '@nestjs/jwt';

const guards = [AuthGuard];
const queryRepositories = [UserQueryRepository];

const providers = [
  TokensService,
  ...queryRepositories,
  ...guards,
  PrismaService,
];

@Module({
  imports: [EnvModule, JwtModule],
  providers: providers,
  exports: providers,
})
export class GuardsModule {}
