import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AccessTokenPayloadType, JwtTokensService } from '@libs/jwt-token';
import { RpcCustomException } from '@libs/common-exceptions';
import { HttpStatus } from '@nestjs/common';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';

export class GetProfileByIdQuery {
  constructor(
    public readonly data: UserContentMicroserviceTypes.GetProfileByIdDTO,
  ) {}
}

@QueryHandler(GetProfileByIdQuery)
export class GetProfileByIdUsecase
  implements
    IQueryHandler<
      GetProfileByIdQuery,
      UserContentGatewayControllerTypes.ProfileSchema
    >
{
  constructor(
    private readonly jwtTokensService: JwtTokensService,
    private readonly userProfileQueryRepository: UserProfileQueryRepository,
  ) {}

  async execute(
    query: GetProfileByIdQuery,
  ): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    const accessTokenPayload: AccessTokenPayloadType | null =
      await this.jwtTokensService.verifyAccessToken(query.data.accessToken);

    let userIdFromToken: number | null;

    if (accessTokenPayload) {
      userIdFromToken = accessTokenPayload.userId;
    }

    const foundProfile = await this.userProfileQueryRepository.getProfileById(
      query.data.profileId,
    );

    if (!foundProfile) {
      throw new RpcCustomException({
        message: 'User profile with provided id is not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return {
      userId: foundProfile.userId,
      username: foundProfile.username,
      firstName: foundProfile.firstName,
      lastName: foundProfile.lastName,
      dateOfBirth: foundProfile.dateOfBirth?.toISOString(),
      country: foundProfile.country,
      city: foundProfile.city,
      aboutMe: foundProfile.aboutMe,
      createdAt: foundProfile.createdAt,
      updatedAt: foundProfile.updatedAt,
      deletedAt: foundProfile.deletedAt,
      profileImageURL: foundProfile?.profileImage?.url ?? null,
      canModify: userIdFromToken == query.data.profileId,
      userAccountType: {
        accountType: foundProfile.user.userAccountType.accountType,
        autoRenewal: foundProfile.user.userAccountType.autoRenewal,
        expireAt: foundProfile.user.userAccountType.expireAt,
        nextPayment: foundProfile.user.userAccountType.nextPayment,
      },
    };
  }
}
