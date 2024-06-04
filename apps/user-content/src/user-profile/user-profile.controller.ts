import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccessTokenUserType } from '@libs/common-guards';
import * as ControllerTypes from '@libs/common-types/user-content/controller';
import { UserContentMicroservicePatterns } from '../../../gateway/src/controllers/user-content/userContentMicroservice.patterns';
import {
  UpdateUserProfileCommand,
  UpdateUserProfileServiceDTO,
} from './application/command-handlers';
import {
  GetMyUserProfileQuery,
  GetUserProfileByIdQuery,
} from './application/query-handlers';

@Controller()
export class UserProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(UserContentMicroservicePatterns.GET_MY_USER_PROFILE)
  async getMyProfile(
    @Payload() user: AccessTokenUserType,
  ): Promise<ControllerTypes.UserProfileResponseGatewayDTO> {
    return this.queryBus.execute(new GetMyUserProfileQuery(user));
  }

  @MessagePattern(UserContentMicroservicePatterns.GET_USER_PROFILE_BY_ID)
  async getProfileById(
    @Payload() payload: { accessToken: string | null; profileId: number },
  ): Promise<ControllerTypes.UserProfileResponseGatewayDTO> {
    return this.queryBus.execute(
      new GetUserProfileByIdQuery({
        accessToken: payload.accessToken,
        profileId: payload.profileId,
      }),
    );
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
