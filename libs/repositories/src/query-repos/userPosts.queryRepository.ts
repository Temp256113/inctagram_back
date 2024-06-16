import { Injectable } from '@nestjs/common';
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

  async getLastFourPosts() {
    return this.prisma.userPost.findMany({
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
      include: { user: true, images: true },
    });
  }
}
