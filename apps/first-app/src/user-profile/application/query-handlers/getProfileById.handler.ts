import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserProfileByIdReturnType } from '../../dto/userProfileReturnTypes';
import { NotFoundException } from '@nestjs/common';
import { AccessTokenPayloadType, TokensService } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';

export class GetProfileByIdQuery {
  constructor(
    public readonly data: {
      profileId: number;
      accessToken: string | undefined;
    },
  ) {}
}

@QueryHandler(GetProfileByIdQuery)
export class GetProfileByIdHandler
  implements IQueryHandler<GetProfileByIdQuery, UserProfileByIdReturnType>
{
  constructor(
    private readonly tokensService: TokensService,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly profileQueryRepository: UserProfileQueryRepository,
  ) {}

  async execute({
    data: query,
  }: GetProfileByIdQuery): Promise<UserProfileByIdReturnType> {
    const userId: number | undefined = await this.getUserId(query.accessToken);

    const foundProfile = await this.profileQueryRepository.getProfileByUserId(
      query.profileId,
    );

    if (!foundProfile) {
      throw new NotFoundException('Profile with provided id is not found');
    }

    return {
      userId: foundProfile.userId,
      canModify: foundProfile.userId === userId,
      username: foundProfile.username,
      firstName: foundProfile.firstName,
      lastName: foundProfile.lastName,
      dateOfBirth: foundProfile.dateOfBirth,
      country: foundProfile.country,
      city: foundProfile.city,
      aboutMe: foundProfile.aboutMe,
      createdAt: foundProfile.createdAt,
      updatedAt: foundProfile.updatedAt,
      deletedAt: foundProfile.deletedAt,
    };
  }

  async getUserId(
    accessToken: string | undefined,
  ): Promise<number | undefined> {
    const accessTokenPayload: AccessTokenPayloadType | null =
      await this.tokensService.verifyAccessToken(accessToken);

    if (!accessTokenPayload) return;

    const foundUser = await this.userQueryRepository.getUserById(
      accessTokenPayload.userId,
    );

    if (!foundUser) return;

    return foundUser.id;
  }
}
