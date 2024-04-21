import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostReturnType } from '../../dto/userPostReturnTypes';
import { FileResourceService } from '../../../file-resourse/file-resource.service';
import { UserPostsRepository } from '../../repositories/userPosts.repository';

export class CreateUserPostCommand {
  constructor(
    public readonly data: {
      userId: number;
      images: Express.Multer.File[];
      description?: string;
    },
  ) {}
}

@CommandHandler(CreateUserPostCommand)
export class CreateUserPostHandler
  implements ICommandHandler<CreateUserPostCommand, UserPostReturnType>
{
  constructor(
    private readonly imageService: FileResourceService,
    private readonly postsRepository: UserPostsRepository,
  ) {}

  async execute({
    data: command,
  }: CreateUserPostCommand): Promise<UserPostReturnType> {
    const createdPost = await this.postsRepository.createPost({
      userId: command.userId,
      description: command.description,
    });

    const loadedImagesForPost =
      await this.imageService.uploadPostImagesToBucketAndDB({
        images: command.images,
        postId: createdPost.id,
        userId: command.userId,
      });

    return {
      postId: createdPost.id,
      postDescription: createdPost.description ?? null,
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
      postImages: loadedImagesForPost
        .sort((a, b) => a.id - b.id)
        .map((loadedImage) => {
          return { imageId: loadedImage.id, imageUrl: loadedImage.url };
        }),
    };
  }
}
