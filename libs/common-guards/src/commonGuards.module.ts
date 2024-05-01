import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { EnvModule } from '@libs/config';
import { JwtTokenModule } from '@libs/jwt-token';
import { RepositoriesModule } from '@libs/repositories/repositories.module';

const guards = [AuthGuard];

// guard это класс который создается каждый запрос, поэтому для использования гарда нужно импортировать вместе с ним
// и все его зависимости. так что здесь импортируются вообще все зависимости которые нужны для работы guards
@Module({
  imports: [EnvModule, JwtTokenModule, RepositoriesModule],
  providers: guards,
  // оказывается модули тоже можно экспортировать
  // если экспортировать модуль то экспортируются все providers которые экспортирует этот модуль
  exports: [...guards, JwtTokenModule, RepositoriesModule],
})
export class CommonGuardsModule {}
