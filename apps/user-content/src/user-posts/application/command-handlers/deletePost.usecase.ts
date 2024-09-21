import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { RpcCustomException } from '@libs/common-exceptions';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import { GoogleDriveService } from '../../../infrastructure/google-drive-storage/googleDrive.service';

export class DeletePostCommand {
  constructor(
    public readonly data: UserContentMicroserviceTypes.DeletePostDTO,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUsecase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
    private readonly googleDriveService: GoogleDriveService,
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

    const deleteImagesFromGoogleDrivePromises = foundPost.images.map((image) =>
      this.googleDriveService.deleteFile(image.googleFileId),
    );

    const deletePostFromDBPromise = await this.postsRepository.deletePostById(
      foundPost.id,
    );

    await Promise.all([
      ...deleteImagesFromGoogleDrivePromises,
      deletePostFromDBPromise,
    ]);
  }
}
