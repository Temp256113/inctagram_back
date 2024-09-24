import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '@libs/repositories/repos/user.repository';
import * as AuthMicroserviceTypes from 'libs/common-types/src/auth/microservice';

export class LogoutCommand {
  constructor(public readonly data: AuthMicroserviceTypes.LogoutDTO) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(private readonly userRepository: UserRepository) {}
  async execute({ data }: LogoutCommand): Promise<void> {
    await this.userRepository.deleteSession({
      userId: data.userId,
      refreshTokenUuid: data.refreshTokenUuid,
    });
  }
}
