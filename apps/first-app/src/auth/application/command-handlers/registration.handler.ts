import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BcryptService } from '../../utils/bcrypt.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { ConflictException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { RegisterDTO } from '../../dto/register.dto';

export class RegistrationCommand {
  constructor(public readonly userRegisterDTO: RegisterDTO) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand, void>
{
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly nodemailerService: NodemailerService,
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async execute(command: RegistrationCommand): Promise<void> {
    const {
      userRegisterDTO: { password, email, username },
    } = command;

    // регистрируется новый юзер
    await this.registerNewUser({ email, username, password });
  }

  async checkUsernameAndEmail(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<'No need to create a new user' | 'Need to create a new user'> {
    const { username, email, password } = data;

    const foundUser =
      await this.userQueryRepository.getUserByEmailOrUsernameWithFullInfo({
        email,
        username,
      });

    if (foundUser?.username === username && foundUser?.email === email) {
      if (!foundUser.userEmailInfo.emailIsConfirmed) {
        const userPasswordIsCorrect: boolean =
          await this.bcryptService.compareHashAndPassword({
            password,
            hash: foundUser.password,
          });

        if (userPasswordIsCorrect) {
          const emailConfirmCode: string = crypto.randomUUID();

          await this.userRepository.updateEmailInfoByUserId(foundUser.id, {
            expiresAt: add(new Date(), { days: 3 }),
            emailConfirmCode,
          });

          await this.nodemailerService.sendRegistrationConfirmMessage({
            email,
            confirmCode: emailConfirmCode,
          });

          return 'No need to create a new user';
        }
      }
    }

    if (foundUser?.email === email) {
      throw new ConflictException('User with this email is already registered');
    } else if (foundUser?.username === username) {
      throw new ConflictException(
        'User with this username is already registered',
      );
    }

    return 'Need to create a new user';
  }

  async registerNewUser(userRegisterDTO: RegisterDTO): Promise<void> {
    const { username, email, password } = userRegisterDTO;

    const createNewUserOrNot = await this.checkUsernameAndEmail({
      email,
      username,
      password,
    });

    const emailConfirmCode: string = crypto.randomUUID();

    if (createNewUserOrNot === 'No need to create a new user') {
      return;
    }

    const createdUser = await this.userRepository.createUser({
      user: {
        email,
        username,
        password: await this.bcryptService.encryptPassword(password),
      },
      emailInfo: {
        registrationConfirmCode: emailConfirmCode,
        registrationCodeEndDate: add(new Date(), { days: 3 }),
        emailIsConfirmed: false,
      },
    });

    await this.nodemailerService.sendRegistrationConfirmMessage({
      email: createdUser.email,
      confirmCode: createdUser.userEmailInfo.emailConfirmCode,
    });
  }
}
