import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptService } from '../../utils/bcrypt.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { HttpStatus, Inject } from '@nestjs/common';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { RegisterDTO } from 'libs/common-types/src/auth/gateway';
import { RpcCustomException } from '@libs/common-exceptions';
import { ClientProxy } from '@nestjs/microservices';
import { WebhooksMicroservicePatterns } from '@libs/microservice-patterns';

export class RegisterCommand {
  constructor(public readonly userRegisterDTO: RegisterDTO) {}
}

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, void> {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly nodemailerService: NodemailerService,
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    @Inject('WEBHOOKS_SERVICE')
    protected readonly webhooksMicroserviceClient: ClientProxy,
  ) {}

  async execute(command: RegisterCommand): Promise<void> {
    const {
      userRegisterDTO: { password, email, username },
    } = command;

    await this.registerNewUser({ email, username, password });
  }

  async registerNewUser(userRegisterDTO: RegisterDTO): Promise<void> {
    const { username, email, password } = userRegisterDTO;

    const needToCreateNewUser: boolean =
      await this.checkNeedRegisterNewUserOrNot({
        email,
        username,
        password,
      });

    if (!needToCreateNewUser) {
      return;
    }

    const emailConfirmationCode: string = crypto.randomUUID();

    await this.userRepository.createUser({
      user: {
        email,
        username,
        password: await this.bcryptService.encryptPassword(password),
      },
      emailInfo: {
        registrationConfirmCode: emailConfirmationCode,
        registrationCodeEndDate: add(new Date(), { days: 3 }),
        emailIsConfirmed: false,
      },
    });

    await this.nodemailerService.sendRegistrationConfirmMessage({
      email,
      confirmCode: emailConfirmationCode,
    });

    this.webhooksMicroserviceClient.emit(
      WebhooksMicroservicePatterns.REGISTER_USER_EVENT,
      null,
    );
  }

  async checkNeedRegisterNewUserOrNot(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean> {
    const { username, email, password } = data;

    const foundUser =
      await this.userQueryRepository.getUserByEmailOrUsernameWithFullInfo({
        email,
        username,
      });

    if (!foundUser) {
      return true;
    }

    const userPasswordIsCorrect: boolean =
      await this.bcryptService.compareHashAndPassword({
        password,
        hash: foundUser.password,
      });

    const canSendConfirmationEmail: boolean =
      foundUser.profile?.username === username &&
      foundUser.email === email &&
      !foundUser.emailInfo?.emailIsConfirmed &&
      userPasswordIsCorrect;

    if (canSendConfirmationEmail) {
      const emailConfirmCode: string = crypto.randomUUID();

      await this.userRepository.updateEmailInfoByUserId(foundUser.id, {
        emailConfirmCodeExpiresAt: add(new Date(), { days: 3 }),
        emailConfirmCode,
      });

      await this.nodemailerService.sendRegistrationConfirmMessage({
        email,
        confirmCode: emailConfirmCode,
      });

      return false;
    }

    if (foundUser.email === email) {
      throw new RpcCustomException({
        message: 'User with this email is already registered',
        status: HttpStatus.CONFLICT,
      });
    } else if (foundUser.profile?.username === username) {
      throw new RpcCustomException({
        message: 'User with this username is already registered',
        status: HttpStatus.CONFLICT,
      });
    }

    return true;
  }
}
