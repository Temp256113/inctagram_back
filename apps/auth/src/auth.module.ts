import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { EnvModule } from '@libs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { BcryptService } from './utils/bcrypt.service';
import { LoginHandler } from './application/command-handlers/login.handler';
import { JwtTokensModule } from '@libs/jwt-token';

const commandHandlers = [LoginHandler];

@Module({
  imports: [EnvModule, CqrsModule, RepositoriesModule, JwtTokensModule],
  controllers: [AuthController],
  providers: [BcryptService, ...commandHandlers],
})
export class AuthModule {}
