import { AccessTokenUserType } from '@libs/common-guards';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserProfileResponseGatewayDTO } from '@libs/common-types/user-content/controller';

export class GetMyUserProfileQuery {
  constructor(public readonly user: AccessTokenUserType) {}
}

@QueryHandler(GetMyUserProfileQuery)
export class GetMyUserProfileHandler
  implements
    IQueryHandler<GetMyUserProfileQuery, UserProfileResponseGatewayDTO>
{
  async execute(
    query: GetMyUserProfileQuery,
  ): Promise<UserProfileResponseGatewayDTO> {
    const user: AccessTokenUserType = query.user;

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
