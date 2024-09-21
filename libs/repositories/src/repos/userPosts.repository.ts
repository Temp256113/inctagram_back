import { Injectable } from '@nestjs/common';
import { FileResourceTypes, Prisma } from '@prisma/client';
import { PrismaService } from '@libs/repositories/prisma.service';

@Injectable()
export class UserPostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(data: { userId: number; description?: string }) {
    try {
      return this.prisma.userPost.create({
        data: {
          userId: data.userId,
          description: data.description ?? null,
        } as Prisma.UserPostUncheckedCreateInput,
        include: { images: true, user: true },
      });
    } catch (err) {
      console.error('Cant create new post', err);
    }
  }

  async createPostImage(data: {
    userId: number;
    postId: number;
    image: Express.Multer.File;
    googleFileId: string;
    url: string;
  }) {
    return this.prisma.fileResource.create({
      data: {
        type: FileResourceTypes.postPhoto,
        contentType: data.image.mimetype,
        size: data.image.size,
        googleFileId: data.googleFileId,
        url: data.url,
        creatorId: data.userId,
        postId: data.postId,
      },
    });
  }

  async updatePostDescriptionByPostId(data: {
    postId: number;
    description: string;
  }) {
    return this.prisma.userPost.update({
      where: { id: data.postId },
      data: { description: data.description },
      include: { images: true, user: true },
    });
  }

  async deletePostById(postId: number) {
    return this.prisma.userPost.delete({
      where: { id: postId },
      include: { images: true },
    });
  }
}
