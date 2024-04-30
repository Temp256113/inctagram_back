import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './controllers/auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { BcryptService } from './utils/bcrypt.service';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { PasswordRecoveryCodeCheckHandler } from './application/commandHandlers/passwordRecovery/passwordRecoveryCodeCheck.handler';
import { UserRepository } from './repositories/user.repository';
import { UserQueryRepository } from './repositories/query/user.queryRepository';
import { PasswordRecoveryRequestHandler } from './application/commandHandlers/passwordRecovery/passwordRecoveryRequest.handler';
import { GithubAuthHandler } from './application/commandHandlers/githubAuth.handler';
import { GoogleAuthHandler } from './application/commandHandlers/googleAuth.handler';
import { LogoutHandler } from './application/commandHandlers/logout.handler';
import { UpdateTokensPairHandler } from './application/commandHandlers/updateTokensPair.handler';
import { CheckRegisterCodeHandler } from './application/checkRegisterCode.handler';
import { RecaptchaService } from './utils/recaptcha.service';
import { ResendRegisterEmailHandler } from './application/commandHandlers/resendRegisterEmail.handler';
import { PasswordRecoveryHandler } from './application/commandHandlers/passwordRecovery/passwordRecovery.handler';
import { RegisterController } from './controllers/register.controller';
import { PasswordRecoveryController } from './controllers/passwordRecovery.controller';
import { SideAuthController } from './controllers/sideAuth.controller';
import { OrmPrismaModule } from '@libs/orm-prisma-service';

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

const repos = [UserRepository];

const queryRepos = [UserQueryRepository];

@Module({
  imports: [CqrsModule, JwtModule, OrmPrismaModule],
  controllers: [
    AuthController,
    RegisterController,
    PasswordRecoveryController,
    SideAuthController,
  ],
  providers: [
    ...commandHandlers,
    ...repos,
    ...queryRepos,
    TokensService,
    NodemailerService,
    BcryptService,
    RecaptchaService,
  ],
})
export class AuthModule {}
