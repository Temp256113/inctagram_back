import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { UserPostResponseDTO } from '@libs/common-types/user-content/controller';
import { S3StorageService } from '../../../infrastructure/s3-storage/s3Storage.service';

export type CreateUserPostServiceDTO = {
  userId: number;
  images: Array<Express.Multer.File & { buffer: any }>;
  description?: string;
};

export class CreateUserPostCommand {
  constructor(public readonly data: CreateUserPostServiceDTO) {}
}

@CommandHandler(CreateUserPostCommand)
export class CreateUserPostHandler
  implements ICommandHandler<CreateUserPostCommand, UserPostResponseDTO>
{
  constructor(
    private readonly s3StorageService: S3StorageService,
    private readonly postsRepository: UserPostsRepository,
  ) {}

  async execute({
    data: command,
  }: CreateUserPostCommand): Promise<UserPostResponseDTO> {
    const createdPost = await this.postsRepository.createPost({
      userId: command.userId,
      description: command.description,
    });

    const loadedImagesForPost = await this.loadPostImages({
      images: command.images,
      userId: command.userId,
      postId: createdPost.id,
    });

    return {
      postId: createdPost.id,
      postDescription: createdPost.description ?? null,
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
      postImages: loadedImagesForPost.map((loadedImage) => {
        return { imageUrl: loadedImage.url };
      }),
      canModify: true,
    };
  }

  async loadPostImages(data: {
    images: Express.Multer.File[];
    postId: number;
    userId: number;
  }) {
    const saveImagesToS3Promises = data.images.map((image) => {
      return this.s3StorageService
        .uploadPostImage({
          image,
          postId: data.postId,
          userId: data.userId,
        })
        .then((res) => {
          return { ...res, image };
        });
    });

    const savedImagesToS3 = await Promise.all(saveImagesToS3Promises);

    const saveImagesToDbPromises = savedImagesToS3.map((image) => {
      return this.postsRepository.createPostImage({
        userId: data.userId,
        postId: data.postId,
        image: image.image,
        url: image.url,
        path: image.path,
      });
    });

    await Promise.all(saveImagesToDbPromises);

    return savedImagesToS3;
  }
}
