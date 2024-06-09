import { Injectable } from '@nestjs/common';
import { UserPostReturnType } from '../../../../apps/first-app/src/user-posts/dto/userPostReturnTypes';
import { PrismaService } from '@libs/repositories/prisma.service';

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
    howMuchSkipPosts: number;
    howManyPostsToTakePerRequest: number;
    userId: number;
  }) {
    return this.prisma.userPost.findMany({
      where: { userId: data.userId },
      take: data.howManyPostsToTakePerRequest,
      skip: data.howMuchSkipPosts,
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });
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
        ownerId: post.userId,
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
