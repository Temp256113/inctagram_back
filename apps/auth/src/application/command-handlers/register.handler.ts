import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptService } from '../../utils/bcrypt.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { HttpStatus } from '@nestjs/common';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { RegisterDTO } from 'libs/common-types/src/auth/gateway';
import { RpcCustomException } from '@libs/common-exceptions';

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
  ) {}

  async execute(command: RegisterCommand): Promise<void> {
    const {
      userRegisterDTO: { password, email, username },
    } = command;

    await this.registerNewUser({ email, username, password });
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

      const updateUserEmailInfo = this.userRepository.updateEmailInfoByUserId(
        foundUser.id,
        {
          emailConfirmCodeExpiresAt: add(new Date(), { days: 3 }),
          emailConfirmCode,
        },
      );

      const sendConfirmationEmail =
        this.nodemailerService.sendRegistrationConfirmMessage({
          email,
          confirmCode: emailConfirmCode,
        });

      await Promise.all([updateUserEmailInfo, sendConfirmationEmail]);

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

  async registerNewUser(userRegisterDTO: RegisterDTO): Promise<void> {
    const { username, email, password } = userRegisterDTO;

    const createNewUserOrNot: boolean =
      await this.checkNeedRegisterNewUserOrNot({
        email,
        username,
        password,
      });

    if (!createNewUserOrNot) {
      return;
    }

    const emailConfirmationCode: string = crypto.randomUUID();

    const createUser = this.userRepository.createUser({
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

    const sendConfirmationEmail =
      this.nodemailerService.sendRegistrationConfirmMessage({
        email,
        confirmCode: emailConfirmationCode,
      });

    await Promise.all([createUser, sendConfirmationEmail]);
  }
}
