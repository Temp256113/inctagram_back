import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { UserPostReturnType } from '../dto/userPostReturnTypes';

@Injectable()
export class UserPostsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPostById(postId: number) {
    return this.prisma.userPost.findUnique({
      where: { id: postId },
      include: { user: true, images: true },
    });
  }

  async getPostsByUserId(data: {
    page: number;
    userId: number;
  }): Promise<UserPostReturnType[]> {
    // 8 потому что за каждый запрос нужно возвращать по 8 постов
    const howMuchSkip = (data.page - 1) * 8;

    const foundPosts = await this.prisma.userPost.findMany({
      where: { userId: data.userId },
      take: 8,
      skip: howMuchSkip,
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });

    const result: UserPostReturnType[] = [];

    foundPosts.forEach((post) => {
      result.push({
        postId: post.id,
        postDescription: post.description ?? null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        postImages: post.images.map((image) => {
          return {
            imageId: image.id,
            imageUrl: image.url,
          };
        }),
      });
    });

    return result;
  }

  async getLastFourPosts(): Promise<UserPostReturnType[]> {
    const foundPosts = await this.prisma.userPost.findMany({
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
      include: { user: true, images: true },
    });

    const mappedPosts: UserPostReturnType[] = foundPosts.map((post) => {
      return {
        postId: post.id,
        postDescription: post.description ?? null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        postImages: post.images.map((image) => {
          return {
            imageId: image.id,
            imageUrl: image.url,
          };
        }),
      };
    });

    return mappedPosts;
  }
}
