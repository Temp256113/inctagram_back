import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { S3StorageService } from '../../../infrastructure/s3-storage/s3Storage.service';
import { RpcCustomException } from '@libs/common-exceptions';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';

export class DeletePostCommand {
  constructor(
    public readonly data: UserContentMicroserviceTypes.DeletePostDTO,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute({ data: command }: DeletePostCommand): Promise<void> {
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

    const deleteImagesFromS3Promises = foundPost.images.map((image) => {
      return this.s3StorageService.deleteFile(image.path);
    });

    const deletePostPromise = await this.postsRepository.deletePostById(
      foundPost.id,
    );

    await Promise.all([...deleteImagesFromS3Promises, deletePostPromise]);
  }
}
