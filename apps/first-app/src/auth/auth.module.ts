import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './controllers/auth.controller';
import { RegistrationHandler } from './application/command-handlers/registration.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { BcryptService } from './utils/bcrypt.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/command-handlers/login.handler';
import { PasswordRecoveryCodeCheckHandler } from './application/command-handlers/password-recovery/passwordRecoveryCodeCheck.handler';
import { PasswordRecoveryRequestHandler } from './application/command-handlers/password-recovery/passwordRecoveryRequest.handler';
import { GithubAuthHandler } from './application/command-handlers/githubAuth.handler';
import { GoogleAuthHandler } from './application/command-handlers/googleAuth.handler';
import { LogoutHandler } from './application/command-handlers/logout.handler';
import { UpdateTokensPairHandler } from './application/command-handlers/updateTokensPair.handler';
import { CheckRegisterCodeHandler } from './application/checkRegisterCode.handler';
import { RecaptchaService } from './utils/recaptcha.service';
import { ResendRegisterEmailHandler } from './application/command-handlers/resendRegisterEmail.handler';
import { PasswordRecoveryHandler } from './application/command-handlers/password-recovery/passwordRecovery.handler';
import { RegisterController } from './controllers/register.controller';
import { PasswordRecoveryController } from './controllers/passwordRecovery.controller';
import { SideAuthController } from './controllers/sideAuth.controller';
import { JwtTokensModule } from '@libs/jwt-token';
import { RepositoriesModule } from '@libs/repositories/repositories.module';

const commandHandlers = [
  RegistrationHandler,
  ResendRegisterEmailHandler,
  LoginHandler,
  LogoutHandler,
  PasswordRecoveryRequestHandler,
  PasswordRecoveryCodeCheckHandler,
  GithubAuthHandler,
  GoogleAuthHandler,
  UpdateTokensPairHandler,
  CheckRegisterCodeHandler,
  PasswordRecoveryHandler,
];

@Module({
  imports: [CqrsModule, RepositoriesModule, JwtTokensModule],
  controllers: [
    AuthController,
    RegisterController,
    PasswordRecoveryController,
    SideAuthController,
  ],
  providers: [
    ...commandHandlers,
    NodemailerService,
    BcryptService,
    RecaptchaService,
  ],
})
export class AuthModule {}
