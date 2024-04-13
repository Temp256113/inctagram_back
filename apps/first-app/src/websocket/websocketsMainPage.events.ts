import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { UserPostReturnType } from '../user-posts/dto/userPostReturnTypes';
import { UserPostsQueryRepository } from '../user-posts/repositories/userPosts.queryRepository';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'mainPage' })
export class WebsocketMainPageEvents
  implements OnGatewayConnection, OnModuleInit
{
  constructor(
    private readonly userPostsQueryRepository: UserPostsQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  @WebSocketServer()
  server: any;
  registeredUsersAmount: number;
  newCreatedPosts: number;

  lastFourPosts: UserPostReturnType[];

  async onModuleInit(): Promise<void> {
    this.newCreatedPosts = 0;

    await this.updateState();

    setInterval(async () => {
      const connectedClientsAmount: number = this.server.sockets.size;

      if (connectedClientsAmount < 1) {
        return;
      }

      await this.updateState();

      this.server.emit('usersAmount', this.registeredUsersAmount);
      this.server.emit('lastPosts', this.lastFourPosts);
    }, 3000);
  }

  async updateState(): Promise<void> {
    const lastFourPosts: UserPostReturnType[] =
      await this.userPostsQueryRepository.getLastFourPosts();

    this.lastFourPosts = lastFourPosts;

    this.registeredUsersAmount =
      await this.userQueryRepository.getUsersAmount();
  }

  handleConnection(): void {
    this.server.emit('usersAmount', this.registeredUsersAmount);
    this.server.emit('lastPosts', this.lastFourPosts);
  }
}
