import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { UserPostResponseDTO } from '@libs/common-types/user-content/controller';
import { CustomRpcException } from '@libs/common-exceptions';

export type UpdateUserPostServiceDTO = {
  userId: number;
  userPostId: number;
  description: string;
};

export class UpdateUserPostCommand {
  constructor(public readonly data: UpdateUserPostServiceDTO) {}
}

@CommandHandler(UpdateUserPostCommand)
export class UpdateUserPostHandler
  implements ICommandHandler<UpdateUserPostCommand, UserPostResponseDTO>
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
  ) {}

  async execute({
    data: command,
  }: UpdateUserPostCommand): Promise<UserPostResponseDTO> {
    const foundPost = await this.postsQueryRepository.getPostById(
      command.userPostId,
    );

    if (!foundPost) {
      throw new CustomRpcException({
        message: 'Not found user post with provided id',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (foundPost.userId !== command.userId) {
      throw new CustomRpcException({
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
    };
  }
}
