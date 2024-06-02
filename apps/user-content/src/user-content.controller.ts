import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccessTokenUserType } from '@libs/common-guards';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';
import * as ControllerTypes from '@libs/common-types/user-content/controller';

@Controller()
export class UserContentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userQueryRepository: UserProfileQueryRepository,
  ) {}

  @MessagePattern('get-my-profile')
  async getMyProfile(
    @Payload() user: AccessTokenUserType,
  ): Promise<ControllerTypes.UserProfileResponseGatewayDTO> {
    const foundUserProfile = await this.userQueryRepository.getProfileByUserId(
      user.id,
    );

    return {
      userId: foundUserProfile.userId,
      username: foundUserProfile.username,
      firstName: foundUserProfile.firstName,
      lastName: foundUserProfile.lastName,
      dateOfBirth: foundUserProfile.dateOfBirth,
      country: foundUserProfile.country,
      city: foundUserProfile.city,
      aboutMe: foundUserProfile.aboutMe,
      createdAt: foundUserProfile.createdAt,
      updatedAt: foundUserProfile.updatedAt,
      deletedAt: foundUserProfile.deletedAt,
      canModify: true,
    };
  }
}
