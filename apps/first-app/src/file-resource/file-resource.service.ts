import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { S3StorageAdapter } from '../../../../shared/services/s3StorageAdapter.service';
import { FileResource, FileResourceTypes } from '@prisma/client';
import { flatten } from 'lodash';
import { FileResourceRepository } from 'shared/repositories/file-resourse.repository';
import { FileResourceQueryRepository } from 'shared/repositories/query/file-resource-query.repository';

type CanManageFileType = {
  userId: number;
  fileId: number | number[];
  type: FileResourceTypes;
};

@Injectable()
export class FileResourceService {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly fileResourceRepository: FileResourceRepository,
    private readonly fileResourceQueryRepository: FileResourceQueryRepository,
  ) {}

  getFileFolder(params: {
    imageType: FileResourceTypes;
    userId: number;
    postId?: number;
  }) {
    switch (params.imageType) {
      case FileResourceTypes.profilePhoto:
        return `users/${params.userId}/profilePhoto`;
      case FileResourceTypes.postPhoto:
        if (!params.postId) {
          throw new Error('Provide post id');
        }

        return `users/${params.userId}/posts/${params.postId}`;
      default:
        throw new BadRequestException('File type not found');
    }
  }

  getPostImageFolder(params: { userId: number; postId: number }) {
    return this.getFileFolder({
      ...params,
      imageType: FileResourceTypes.postPhoto,
    });
  }

  private async checkCountFileResource(data: CanManageFileType) {
    const fileIds: number[] = flatten([data.fileId]);

    // сюда передается массив с fileIds
    // если вернется из бд количество сущностей меньше чем передавалось
    // значит какие то из передаваемых fileIds были украдены у другого юзера
    const fileResourceCount = await this.fileResourceQueryRepository.getCount({
      fileIds,
      createdById: data.userId,
      type: data.type,
    });

    return fileResourceCount === fileIds.length;
  }

  async canManageFileResource(data: CanManageFileType) {
    const allEntitiesIsMine: boolean = await this.checkCountFileResource(data);

    if (data.fileId && !allEntitiesIsMine) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }

  async upload({
    userId,
    file,
    imageType,
  }: {
    userId: number;
    file: Express.Multer.File;
    imageType: FileResourceTypes;
  }) {
    const folder = this.getFileFolder({ userId, imageType });

    const { url, path } = await this.s3StorageAdapter.upload({ file, folder });

    return this.fileResourceRepository.create({
      type: imageType,
      contentType: file.mimetype,
      size: file.size,
      path,
      url,
      createdById: userId,
    });
  }

  async uploadPostImagesToBucketAndDB(data: {
    userId: number;
    postId: number;
    images: Express.Multer.File[];
  }) {
    const uploadImagesToDB: Promise<FileResource>[] = [];

    for (const postImage of data.images) {
      const folder = this.getPostImageFolder({
        userId: data.userId,
        postId: data.postId,
      });

      const { url, path } = await this.s3StorageAdapter.upload({
        file: postImage,
        folder,
      });

      uploadImagesToDB.push(
        this.fileResourceRepository.create({
          type: FileResourceTypes.postPhoto,
          contentType: postImage.mimetype,
          size: postImage.size,
          path,
          url,
          createdById: data.userId,
          postId: data.postId,
        }),
      );
    }

    return Promise.all(uploadImagesToDB);
  }

  async delete(data: { imagePath: string; imageId: number }) {
    await this.s3StorageAdapter.delete(data.imagePath);

    await this.fileResourceRepository.delete({ id: data.imageId });
  }

  async deleteImagesFromBucket(imagesPaths: string[]): Promise<void> {
    await Promise.all(
      imagesPaths.map((imagePath) => this.s3StorageAdapter.delete(imagePath)),
    );
  }
}
