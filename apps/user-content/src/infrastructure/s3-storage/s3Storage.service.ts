import { S3StorageAdapter } from './s3Storage.adapter';
import { FileResourceTypes } from '@prisma/client';
import { Injectable } from '@nestjs/common';

type ImageType = Express.Multer.File;

@Injectable()
export class S3StorageService {
  constructor(private readonly s3Adapter: S3StorageAdapter) {}

  private getFileDirectory(data: {
    imageType: FileResourceTypes;
    userId: number;
    postId?: number;
  }): string {
    if (data.imageType === FileResourceTypes.profilePhoto) {
      return `users/${data.userId}/profilePhoto`;
    } else if (data.imageType === FileResourceTypes.postPhoto) {
      return `users/${data.userId}/posts/${data.postId}`;
    }
  }

  async uploadProfileImage(data: {
    userId: number;
    image: ImageType;
  }): Promise<{ url: string; path: string }> {
    const dir = this.getFileDirectory({
      imageType: FileResourceTypes.profilePhoto,
      userId: data.userId,
    });

    return this.s3Adapter.uploadToS3({ directory: dir, file: data.image });
  }

  async uploadPostImage(data: {
    userId: number;
    image: ImageType;
    postId: number;
  }): Promise<{ url: string; path: string }> {
    const dir = this.getFileDirectory({
      imageType: FileResourceTypes.postPhoto,
      userId: data.userId,
      postId: data.postId,
    });

    return this.s3Adapter.uploadToS3({ directory: dir, file: data.image });
  }

  async deleteFile(path: string): Promise<void> {
    await this.s3Adapter.deleteFromS3(path);
  }
}
