import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MainPageEventsService implements OnModuleInit {
  private registeredUsersAmount: number;
  private newCreatedPostsAmount: number;
  private frontendWebhooksUrl: string;

  constructor(
    private readonly userPostsQueryRepository: UserPostsQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    this.frontendWebhooksUrl = 'https://inctagram-front.vercel.app';

    this.registeredUsersAmount =
      await this.userQueryRepository.getUsersAmount();

    this.newCreatedPostsAmount = 0;
  }

  @Cron('*/1 * * * *') //every minute
  async sendActualDataEveryMinute(): Promise<void> {
    this.newCreatedPostsAmount = 0;

    const mappedLastFourPosts: UserContentGatewayControllerTypes.PostResponseDTO[] =
      await this.getMappedLastFourPosts();

    axios
      .post(this.frontendWebhooksUrl, {
        lastCreatedPosts: mappedLastFourPosts,
        registeredUsersAmount: this.registeredUsersAmount,
      })
      .catch((err) => {
        console.error('every minute send data to main page error', err.message);
      });
  }

  increaseRegisteredUsersAmount(): void {
    this.registeredUsersAmount += 1;

    // надо обновлять счетчик юзеров на главной странице
    // каждые 5 новых зарегистрированных юзеров или раз в минуту
    if (this.registeredUsersAmount % 5 == 0) {
      axios
        .post(this.frontendWebhooksUrl, {
          registeredUsersAmount: this.registeredUsersAmount,
        })
        .catch((err) => {
          console.error(
            'send data about registered users amount error',
            err.message,
          );
        });
    }
  }

  async increaseNewCreatedPostsAmount(): Promise<void> {
    this.newCreatedPostsAmount += 1;

    // надо показывать 4 последних созданных поста на главной странице
    // они обновляются каждые 4 новых созданных поста или раз в минуту
    if (this.newCreatedPostsAmount % 4 == 0) {
      this.newCreatedPostsAmount = 0;

      const mappedLastFourPosts: UserContentGatewayControllerTypes.PostResponseDTO[] =
        await this.getMappedLastFourPosts();

      axios
        .post(this.frontendWebhooksUrl, {
          lastCreatedPosts: mappedLastFourPosts,
        })
        .catch((err) => {
          console.error('send data about new created posts error', err.message);
        });
    }
  }

  private async getMappedLastFourPosts(): Promise<
    UserContentGatewayControllerTypes.PostResponseDTO[]
  > {
    const lastFourPosts =
      await this.userPostsQueryRepository.getLastFourPosts();

    const mappedLastFourPosts: UserContentGatewayControllerTypes.PostResponseDTO[] =
      lastFourPosts.map((post) => {
        return {
          postId: post.id,
          ownerId: post.userId,
          postDescription: post.description ?? null,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          postImages: post.images.map((image) => {
            return {
              imageUrl: image.url,
            };
          }),
          canModify: false,
        };
      });

    return mappedLastFourPosts;
  }
}
