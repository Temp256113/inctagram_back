import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { AccessTokenPayloadType, JwtTokensService } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { RpcCustomException } from '@libs/common-exceptions';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';

export class GetPostByIdQuery {
  constructor(
    public readonly data: UserContentMicroserviceTypes.GetPostByIdDTO,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetUserPostByIdUsecase
  implements
    IQueryHandler<
      GetPostByIdQuery,
      UserContentGatewayControllerTypes.PostSchema
    >
{
  constructor(
    private readonly jwtTokensService: JwtTokensService,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
  ) {}

  async execute({
    data: query,
  }: GetPostByIdQuery): Promise<UserContentGatewayControllerTypes.PostSchema> {
    const userId: number | undefined = await this.getUserId(query.accessToken);

    const foundPost = await this.postsQueryRepository.getPostById(query.postId);

    if (!foundPost) {
      throw new RpcCustomException({
        message: 'Post with provided id is not found',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return {
      postId: foundPost.id,
      canModify: foundPost.userId === userId,
      postDescription: foundPost.description,
      createdAt: foundPost.createdAt,
      updatedAt: foundPost.updatedAt,
      postImages: foundPost.images.map((image) => {
        return {
          imageUrl: image.url,
        };
      }),
    };
  }

  async getUserId(accessToken: string | undefined): Promise<number | null> {
    const accessTokenPayload: AccessTokenPayloadType | null =
      await this.jwtTokensService.verifyAccessToken(accessToken);

    if (!accessTokenPayload) return null;

    const foundUser = await this.userQueryRepository.getUserById(
      accessTokenPayload.userId,
    );

    if (!foundUser) return null;

    return foundUser.id;
  }
}
