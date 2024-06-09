import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserPostResponseDTO } from '@libs/common-types/user-content/controller';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';

export type GetMyUserPostsServiceDTO = {
  userId: number;
  page: number;
};

export class GetMyUserPostsQuery {
  constructor(public readonly data: GetMyUserPostsServiceDTO) {}
}

@QueryHandler(GetMyUserPostsQuery)
export class GetMyUserPostsHandler
  implements IQueryHandler<GetMyUserPostsQuery, UserPostResponseDTO[]>
{
  constructor(
    private readonly postsQueryRepository: UserPostsQueryRepository,
  ) {}

  async execute({
    data: query,
  }: GetMyUserPostsQuery): Promise<UserPostResponseDTO[]> {
    const howManyPostsToTakePerRequest = 8;

    // 8 потому что за каждый запрос нужно возвращать по 8 постов
    const howMuchSkip = (query.page - 1) * howManyPostsToTakePerRequest;

    const foundPosts = await this.postsQueryRepository.getPostsByUserId({
      howMuchSkipPosts: howMuchSkip,
      howManyPostsToTakePerRequest,
      userId: query.userId,
    });

    const mappedPosts: UserPostResponseDTO[] = foundPosts.map((post) => {
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
