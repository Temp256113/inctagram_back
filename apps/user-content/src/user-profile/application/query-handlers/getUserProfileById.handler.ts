import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserProfileResponseGatewayDTO } from '@libs/common-types/user-content/controller';
import { AccessTokenPayloadType, JwtTokensService } from '@libs/jwt-token';
import { CustomRpcException } from '@libs/common-exceptions';
import { HttpStatus } from '@nestjs/common';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';

export class GetUserProfileByIdQuery {
  constructor(
    public readonly data: { accessToken: string | null; profileId: number },
  ) {}
}

@QueryHandler(GetUserProfileByIdQuery)
export class GetUserProfileByIdHandler
  implements
    IQueryHandler<GetUserProfileByIdQuery, UserProfileResponseGatewayDTO>
{
  constructor(
    private readonly jwtTokensService: JwtTokensService,
    private readonly userProfileQueryRepository: UserProfileQueryRepository,
  ) {}

  async execute(
    query: GetUserProfileByIdQuery,
  ): Promise<UserProfileResponseGatewayDTO> {
    const accessTokenPayload: AccessTokenPayloadType | null =
      await this.jwtTokensService.verifyAccessToken(query.data.accessToken);

    let userIdFromToken: number | null;

    if (accessTokenPayload) {
      userIdFromToken = accessTokenPayload.userId;
    }

    const foundUserProfile =
      await this.userProfileQueryRepository.getProfileById(
        query.data.profileId,
      );

    if (!foundUserProfile) {
      throw new CustomRpcException({
        message: 'User profile with provided id is not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

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
      canModify: userIdFromToken == query.data.profileId,
    };
  }
}
