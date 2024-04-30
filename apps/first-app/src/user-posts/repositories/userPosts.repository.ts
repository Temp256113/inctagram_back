import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/orm-prisma';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { websocketsMainPageStateEvents } from '../../websocket/main-page/websocketsMainPage.service';

@Injectable()
export class UserPostsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPost(data: { userId: number; description?: string }) {
    try {
      this.eventEmitter.emit(websocketsMainPageStateEvents.CREATE_POST);

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
