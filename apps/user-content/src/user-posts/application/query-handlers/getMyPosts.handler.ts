import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';

export class GetMyPostsQuery {
  constructor(
    public readonly data: UserContentMicroserviceTypes.GetMyPostsDTO,
  ) {}
}

@QueryHandler(GetMyPostsQuery)
export class GetMyPostsHandler
  implements
    IQueryHandler<
      GetMyPostsQuery,
      UserContentGatewayControllerTypes.PostResponseDTO[]
    >
{
  constructor(
    private readonly postsQueryRepository: UserPostsQueryRepository,
  ) {}

  async execute({
    data: query,
  }: GetMyPostsQuery): Promise<
    UserContentGatewayControllerTypes.PostResponseDTO[]
  > {
    const howManyPostsToTakePerRequest = 8;

    // 8 потому что за каждый запрос нужно возвращать по 8 постов
    const howMuchSkip = (query.page - 1) * howManyPostsToTakePerRequest;

    const foundPosts = await this.postsQueryRepository.getPostsByUserId({
      howMuchSkipPosts: howMuchSkip,
      howManyPostsToTakePerRequest,
      userId: query.userId,
    });

    const mappedPosts: UserContentGatewayControllerTypes.PostResponseDTO[] =
      foundPosts.map((post) => {
        return {
          postId: post.id,
          postDescription: null,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          postImages: post.images.map((image) => {
            return {
              imageUrl: image.url,
            };
          }),
          canModify: true,
        };
      });

    return mappedPosts;
  }
}
