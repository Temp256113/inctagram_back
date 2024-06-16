import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import { S3StorageService } from '../../../infrastructure/s3-storage/s3Storage.service';
import * as UserContentGatewayControllerTypes from 'libs/common-types/src/user-content/gateway';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WebhooksMicroservicePatterns } from '@libs/microservice-patterns';

export class CreatePostCommand {
  constructor(
    public readonly data: UserContentMicroserviceTypes.CreatePostDTO,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements
    ICommandHandler<
      CreatePostCommand,
      UserContentGatewayControllerTypes.PostResponseDTO
    >
{
  constructor(
    private readonly s3StorageService: S3StorageService,
    private readonly postsRepository: UserPostsRepository,
    @Inject('WEBHOOKS_SERVICE')
    protected readonly webhooksMicroserviceClient: ClientProxy,
  ) {}

  async execute({
    data: command,
  }: CreatePostCommand): Promise<UserContentGatewayControllerTypes.PostResponseDTO> {
    const createdPost = await this.postsRepository.createPost({
      userId: command.userId,
      description: command.description,
    });

    const loadedImagesForPost = await this.loadPostImages({
      images: command.images,
      userId: command.userId,
      postId: createdPost.id,
    });

    this.webhooksMicroserviceClient.emit(
      WebhooksMicroservicePatterns.CREATE_POST_EVENT,
      'null',
    );

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
