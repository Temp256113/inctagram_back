import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserQueryRepository } from '../../apps/first-app/src/auth/repositories/query/user.queryRepository';
import { TokensService } from '../../apps/first-app/src/auth/utils/tokens.service';
import { EnvModule } from '@libs/config';
import { JwtModule } from '@nestjs/jwt';
import { OrmPrismaModule } from '@libs/orm-prisma';

const guards = [AuthGuard];
const queryRepositories = [UserQueryRepository];

const providers = [TokensService, ...queryRepositories, ...guards];

@Module({
  imports: [EnvModule, JwtModule, OrmPrismaModule],
  providers: providers,
  exports: providers,
})
export class GuardsModule {}
