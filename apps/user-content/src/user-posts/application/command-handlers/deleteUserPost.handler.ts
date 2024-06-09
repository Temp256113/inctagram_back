import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { S3StorageService } from '../../../infrastructure/s3-storage/s3Storage.service';

export type DeleteUserPostServiceDTO = { userId: number; userPostId: number };

export class DeleteUserPostCommand {
  constructor(public readonly data: DeleteUserPostServiceDTO) {}
}

@CommandHandler(DeleteUserPostCommand)
export class DeleteUserPostHandler
  implements ICommandHandler<DeleteUserPostCommand, void>
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
    private readonly s3StorageService: S3StorageService,
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

    const deleteImagesFromS3Promises = foundPost.images.map((image) => {
      return this.s3StorageService.deleteFile(image.path);
    });

    const deletePostPromise = await this.postsRepository.deletePostById(
      foundPost.id,
    );

    await Promise.all([...deleteImagesFromS3Promises, deletePostPromise]);
  }
}
