import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { UserPostReturnType } from '../../user-posts/dto/userPostReturnTypes';
import { OnEvent } from '@nestjs/event-emitter';
import { minutesToMilliseconds } from 'date-fns';
import { UserPostsQueryRepository } from '@libs/repositories/query-repos/userPosts.queryRepository';
import { UserQueryRepository } from '@libs/repositories/query-repos/user.queryRepository';

export enum websocketsMainPageStateEvents {
  CREATE_USER = 'websocketsMainPageState.createNewUser',
  CREATE_POST = 'websocketsMainPageState.createNewPost',
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'mainPage' })
export class WebsocketsMainPageService
  implements OnGatewayConnection, OnModuleInit
{
  constructor(
    private readonly userPostsQueryRepository: UserPostsQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  private registeredUsersAmount: number;
  private newCreatedPostsAmount: number;
  private lastFourPosts: UserPostReturnType[];

  @WebSocketServer()
  server: any;

  async onModuleInit(): Promise<void> {
    this.newCreatedPostsAmount = 0;
    this.registeredUsersAmount =
      await this.userQueryRepository.getUsersAmount();

    await this.updateLastFourPosts();

    setInterval(async () => {
      const connectedClientsAmount: number = this.server.sockets.size;

      if (connectedClientsAmount < 1) {
        return;
      }

      await this.updateLastFourPosts();

      this.sendRegisteredUsersAmount();
      this.sendLastFourPosts();
    }, minutesToMilliseconds(1));
  }

  handleConnection(): void {
    this.sendRegisteredUsersAmount();
    this.sendLastFourPosts();
  }

  sendRegisteredUsersAmount(): void {
    this.server.emit('usersAmount', this.registeredUsersAmount);
  }

  sendLastFourPosts(): void {
    this.server.emit('lastPosts', this.lastFourPosts);
  }

  async updateLastFourPosts(): Promise<void> {
    this.newCreatedPostsAmount = 0;

    this.lastFourPosts = await this.userPostsQueryRepository.getLastFourPosts();
  }

  @OnEvent(websocketsMainPageStateEvents.CREATE_USER)
  increaseRegisteredUsersAmount(): void {
    this.registeredUsersAmount += 1;

    // надо обновлять счетчик юзеров на главной странице
    // каждые 5 новых зарегистрированных юзеров или раз в минуту
    if (this.registeredUsersAmount % 5 == 0) {
      this.sendRegisteredUsersAmount();
    }
  }

  @OnEvent(websocketsMainPageStateEvents.CREATE_POST)
  async increaseNewCreatedPostsAmount(): Promise<void> {
    this.newCreatedPostsAmount += 1;

    // надо показывать 4 последних созданных поста на главной странице
    // они обновляются каждые 4 новых созданных поста или раз в минуту
    if (this.newCreatedPostsAmount % 4 == 0) {
      await this.updateLastFourPosts();

      this.sendLastFourPosts();
    }
  }
}
