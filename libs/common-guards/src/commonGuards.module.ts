import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { UserQueryRepository } from '../../../apps/first-app/src/auth/repositories/query/user.queryRepository';
import { EnvModule } from '@libs/config';
import { OrmPrismaModule } from '@libs/orm-prisma';
import { JwtTokenModule } from '@libs/jwt-token';

const guards = [AuthGuard];
const queryRepositories = [UserQueryRepository];

const providers = [...queryRepositories, ...guards];

// guard это класс который создается каждый запрос, поэтому для использования гарда нужно импортировать вместе с ним
// и все его зависимости. так что здесь импортируются вообще все зависимости которые нужны для работы guards
@Module({
  imports: [EnvModule, OrmPrismaModule, JwtTokenModule],
  providers: providers,
  // оказывается модули тоже можно экспортировать
  // если экспортировать модуль то экспортируются все providers которые экспортирует этот модуль
  exports: [...providers, JwtTokenModule, OrmPrismaModule],
})
export class CommonGuardsModule {}
