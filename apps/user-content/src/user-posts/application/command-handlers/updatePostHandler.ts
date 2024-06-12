import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { RpcCustomException } from '@libs/common-exceptions';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';

export class UpdatePostCommand {
  constructor(
    public readonly data: UserContentMicroserviceTypes.UpdatePostDTO,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler
  implements
    ICommandHandler<
      UpdatePostCommand,
      UserContentGatewayControllerTypes.PostResponseDTO
    >
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
  ) {}

  async execute({
    data: command,
  }: UpdatePostCommand): Promise<UserContentGatewayControllerTypes.PostResponseDTO> {
    const foundPost = await this.postsQueryRepository.getPostById(
      command.userPostId,
    );

    if (!foundPost) {
      throw new RpcCustomException({
        message: 'Not found user post with provided id',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (foundPost.userId !== command.userId) {
      throw new RpcCustomException({
        message: 'The user post with the provided id does not belong to you',
        status: HttpStatus.FORBIDDEN,
      });
    }

    const updatedPost =
      await this.postsRepository.updatePostDescriptionByPostId({
        postId: command.userPostId,
        description: command.description,
      });

    return {
      postId: updatedPost.id,
      postDescription: updatedPost.description,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      postImages: updatedPost.images.map((image) => {
        return { imageUrl: image.url };
      }),
      canModify: true,
    };
  }
}
