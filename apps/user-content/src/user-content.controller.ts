import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccessTokenUserType } from '@libs/common-guards';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';
import * as ControllerTypes from '@libs/common-types/user-content/controller';
import { UserContentMicroservicePatterns } from '../../gateway/src/controllers/user-content/userContentMicroservice.patterns';
import {
  UpdateUserProfileCommand,
  UpdateUserProfileServiceDTO,
} from './application/command-handlers';

@Controller()
export class UserContentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userQueryRepository: UserProfileQueryRepository,
  ) {}

  @MessagePattern('create-new-user-profile')
  async createNewUserProfile() {}

  @MessagePattern(UserContentMicroservicePatterns.GET_MY_USER_PROFILE)
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
      profileImageURL: foundUserProfile?.profileImage?.url ?? null,
      canModify: true,
    };
  }

  @MessagePattern(UserContentMicroservicePatterns.UPDATE_USER_PROFILE)
  async updateProfile(
    @Payload() updateProfileDTO: UpdateUserProfileServiceDTO,
  ): Promise<ControllerTypes.UserProfileResponseGatewayDTO> {
    if (updateProfileDTO.newProfileImage) {
      // rabbitmq для того чтобы передавать данные по очередям сериализует тип данных buffer в json
      // поэтому нужно получившийся в результате массив с числами десериализовать обратно в buffer
      updateProfileDTO.newProfileImage.buffer = Buffer.from(
        updateProfileDTO.newProfileImage.buffer.data,
      );
    }

    return this.commandBus.execute(
      new UpdateUserProfileCommand(updateProfileDTO),
    );
  }
}
