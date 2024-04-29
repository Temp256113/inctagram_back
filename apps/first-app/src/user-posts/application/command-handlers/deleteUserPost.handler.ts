import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserPostsRepository } from '../../repositories/userPosts.repository';
import { UserPostsQueryRepository } from '../../repositories/userPosts.queryRepository';
import { FileResourceService } from '../../../file-resource/file-resource.service';

export class DeleteUserPostCommand {
  constructor(public readonly data: { userId: number; userPostId: number }) {}
}

@CommandHandler(DeleteUserPostCommand)
export class DeleteUserPostHandler
  implements ICommandHandler<DeleteUserPostCommand, void>
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
    private readonly imagesService: FileResourceService,
  ) {}

  async execute({ data: command }: DeleteUserPostCommand): Promise<void> {
    const foundPost = await this.postsQueryRepository.getPostById(
      command.userPostId,
    );

    if (!foundPost) {
      throw new NotFoundException('Not found user post with provided id');
    }

    if (foundPost.userId !== command.userId) {
      throw new ForbiddenException(
        'The user post with the provided id does not belong to you',
      );
    }

    const deletedPost = await this.postsRepository.deletePostById(foundPost.id);

    await this.imagesService.deleteImagesFromBucket(
      deletedPost.images.map((image) => image.path),
    );
  }
}
