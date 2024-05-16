import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { EnvModule } from '@libs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { BcryptService } from './utils/bcrypt.service';
import { LoginHandler } from './application/command-handlers/login.handler';
import { JwtTokensModule } from '@libs/jwt-token';
import { UpdateTokensPairHandler } from './application/command-handlers/updateTokensPair.handler';
import { LogoutHandler } from './application/command-handlers/logout.handler';
import { PasswordRecoveryRequestHandler } from './application/command-handlers/password-recovery/passwordRecoveryRequest.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { RecaptchaService } from './utils/recaptcha.service';
import { PasswordRecoveryCodeCheckHandler } from './application/command-handlers/password-recovery/passwordRecoveryCodeCheck.handler';
import { PasswordRecoveryHandler } from './application/command-handlers/password-recovery/passwordRecovery.handler';

const commandHandlers = [
  LoginHandler,
  UpdateTokensPairHandler,
  LogoutHandler,
  PasswordRecoveryRequestHandler,
  PasswordRecoveryCodeCheckHandler,
  PasswordRecoveryHandler,
];

@Module({
  imports: [EnvModule, CqrsModule, RepositoriesModule, JwtTokensModule],
  controllers: [AuthController],
  providers: [
    BcryptService,
    NodemailerService,
    RecaptchaService,
    ...commandHandlers,
  ],
})
export class AuthModule {}
