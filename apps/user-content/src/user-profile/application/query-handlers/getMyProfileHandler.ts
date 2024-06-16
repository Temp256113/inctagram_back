import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';

export class GetMyProfileQuery {
  constructor(
    public readonly data: UserContentMicroserviceTypes.GetMyProfileDTO,
  ) {}
}

@QueryHandler(GetMyProfileQuery)
export class GetMyProfileHandler
  implements
    IQueryHandler<
      GetMyProfileQuery,
      UserContentGatewayControllerTypes.ProfileResponseDTO
    >
{
  async execute(
    query: GetMyProfileQuery,
  ): Promise<UserContentGatewayControllerTypes.ProfileResponseDTO> {
    const user: UserContentMicroserviceTypes.GetMyProfileDTO = query.data;

    return {
      userId: user.id,
      username: user.profile.username,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      dateOfBirth: user.profile.dateOfBirth,
      country: user.profile.country,
      city: user.profile.city,
      aboutMe: user.profile.aboutMe,
      createdAt: user.profile.createdAt,
      updatedAt: user.profile.updatedAt,
      deletedAt: user.profile.deletedAt,
      profileImageURL: user?.profile?.profileImage?.url ?? null,
      canModify: true,
    };
  }
}
