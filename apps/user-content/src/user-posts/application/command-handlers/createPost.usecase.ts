import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostsRepository } from '@libs/repositories/repos/userPosts.repository';
import * as UserContentGatewayControllerTypes from 'libs/common-types/src/user-content/gateway';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WebhooksMicroservicePatterns } from '@libs/microservice-patterns';
import { GoogleDriveService } from '../../../infrastructure/google-drive-storage/googleDrive.service';

export class CreatePostCommand {
  constructor(
    public readonly data: UserContentMicroserviceTypes.CreatePostDTO,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUsecase
  implements
    ICommandHandler<
      CreatePostCommand,
      UserContentGatewayControllerTypes.PostSchema
    >
{
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly postsRepository: UserPostsRepository,
    @Inject('WEBHOOKS_SERVICE')
    protected readonly webhooksMicroserviceClient: ClientProxy,
  ) {}

  async execute({
    data: dto,
  }: CreatePostCommand): Promise<UserContentGatewayControllerTypes.PostSchema> {
    const createdPost = await this.postsRepository.createPost({
      userId: dto.userId,
      description: dto.description,
    });

    const loadedImagesForPost = await this.loadPostImages({
      images: dto.images,
      userId: dto.userId,
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
        return { imageUrl: loadedImage.directLink };
      }),
      canModify: true,
    };
  }

  async loadPostImages(data: {
    images: Express.Multer.File[];
    postId: number;
    userId: number;
  }) {
    const saveImagesToGoogleDrivePromises = data.images.map((image) =>
      this.googleDriveService.upload(image).then((res) => ({ ...res, image })),
    );

    const savedImagesToGoogleDrive = await Promise.all(
      saveImagesToGoogleDrivePromises,
    );

    const saveImagesToDbPromises = savedImagesToGoogleDrive.map((image) => {
      return this.postsRepository.createPostImage({
        userId: data.userId,
        postId: data.postId,
        image: image.image,
        url: image.directLink,
        googleFileId: image.uploadedFileId,
      });
    });

    await Promise.all(saveImagesToDbPromises);

    return savedImagesToGoogleDrive;
  }
}
