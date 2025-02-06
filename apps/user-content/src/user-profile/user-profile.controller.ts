import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import {
  GetMyProfileQuery,
  GetProfileByIdQuery,
} from './application/query-handlers';
import { UpdateProfileCommand } from './application/command-handlers';
import { AccessTokenUserType } from '@libs/common-types/guards/accessToken.guard.types';
import { UserContentMicroservicePatterns } from '@libs/microservice-patterns';

@Controller()
export class UserProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(UserContentMicroservicePatterns.GET_MY_PROFILE)
  async getMyProfile(
    @Payload() user: AccessTokenUserType,
  ): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    return this.queryBus.execute(new GetMyProfileQuery(user));
  }

  @MessagePattern(UserContentMicroservicePatterns.GET_PROFILE_BY_ID)
  async getProfileById(
    @Payload() payload: { accessToken: string | null; profileId: number },
  ): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    return this.queryBus.execute(
      new GetProfileByIdQuery({
        accessToken: payload.accessToken,
        profileId: payload.profileId,
      }),
    );
  }

  @MessagePattern(UserContentMicroservicePatterns.UPDATE_PROFILE)
  async updateProfile(
    @Payload() updateProfileDTO: UserContentMicroserviceTypes.UpdateProfileDTO,
  ): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    if (updateProfileDTO.newProfileImage) {
      // rabbitmq для того чтобы передавать данные по очередям сериализует тип данных buffer в json
      // поэтому нужно получившийся в результате массив с числами десериализовать обратно в buffer
      updateProfileDTO.newProfileImage.buffer = Buffer.from(
        updateProfileDTO.newProfileImage.buffer.data,
      );
    }

    return this.commandBus.execute(new UpdateProfileCommand(updateProfileDTO));
  }
}
