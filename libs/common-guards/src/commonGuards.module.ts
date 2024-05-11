import { Module } from '@nestjs/common';
import { AccessTokenGuard } from './accessToken.guard';
import { EnvModule } from '@libs/config';
import { JwtTokensModule } from '@libs/jwt-token';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { RefreshTokenGuard } from '@libs/common-guards/refreshToken.guard';

const guards = [AccessTokenGuard, RefreshTokenGuard];

// guard это класс который создается каждый запрос, поэтому для использования гарда нужно импортировать вместе с ним
// и все его зависимости. так что здесь импортируются вообще все зависимости которые нужны для работы guards
@Module({
  imports: [EnvModule, JwtTokensModule, RepositoriesModule],
  providers: guards,
  // оказывается модули тоже можно экспортировать
  // если экспортировать модуль то экспортируются все providers которые экспортирует этот модуль
  exports: [...guards, JwtTokensModule, RepositoriesModule],
})
export class CommonGuardsModule {}
