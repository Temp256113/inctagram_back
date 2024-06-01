import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { EnvModule } from '@libs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoriesModule } from '@libs/repositories/repositories.module';
import { BcryptService } from './utils/bcrypt.service';
import { JwtTokensModule } from '@libs/jwt-token';
import { NodemailerService } from './utils/nodemailer.service';
import { RecaptchaService } from './utils/recaptcha.service';
import * as Commands from './application/command-handlers/index';

const commandHandlers = [
  Commands.LoginHandler,
  Commands.UpdateTokensPairHandler,
  Commands.LogoutHandler,
  Commands.PasswordRecoveryRequestHandler,
  Commands.PasswordRecoveryCodeCheckHandler,
  Commands.PasswordRecoveryHandler,
  Commands.RegisterHandler,
  Commands.RegisterCodeCheckHandler,
  Commands.ResendRegisterEmailHandler,
  Commands.GoogleAuthHandler,
  Commands.GithubAuthHandler,
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
