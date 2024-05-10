import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserPostByIdReturnType } from '../../dto/userPostReturnTypes';
import { NotFoundException } from '@nestjs/common';
import { AccessTokenPayloadType, JwtTokensService } from '@libs/jwt-token';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';

export class GetPostByIdQuery {
  constructor(
    public readonly data: { postId: number; accessToken: string | undefined },
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler
  implements IQueryHandler<GetPostByIdQuery, UserPostByIdReturnType>
{
  constructor(
    private readonly tokensService: JwtTokensService,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
  ) {}

  async execute({
    data: query,
  }: GetPostByIdQuery): Promise<UserPostByIdReturnType> {
    const userId: number | undefined = await this.getUserId(query.accessToken);

    const foundPost = await this.postsQueryRepository.getPostById(query.postId);

    if (!foundPost) {
      throw new NotFoundException('Post with provided id is not found');
    }

    return {
      postId: foundPost.id,
      canModify: foundPost.userId === userId,
      postDescription: foundPost.description,
      createdAt: foundPost.createdAt,
      updatedAt: foundPost.updatedAt,
      postImages: foundPost.images.map((image) => {
        return {
          imageId: image.id,
          imageUrl: image.url,
        };
      }),
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
