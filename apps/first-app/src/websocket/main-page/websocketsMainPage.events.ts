import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { WebsocketsMainPageStateService } from './websockets.mainPageState.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'mainPage' })
export class WebsocketsMainPageEvents
  implements OnGatewayConnection, OnModuleInit
{
  constructor(private readonly stateService: WebsocketsMainPageStateService) {}

  @WebSocketServer()
  server: any;

  async onModuleInit(): Promise<void> {
    setInterval(async () => {
      const connectedClientsAmount: number = this.server.sockets.size;

      if (connectedClientsAmount < 1) {
        return;
      }

      await this.stateService.updateLastFourPosts();

      this.server.emit(
        'usersAmount',
        this.stateService.getRegisteredUsersAmount(),
      );
      this.server.emit('lastPosts', this.stateService.getLastFourPosts());
    }, 3000);
  }

  handleConnection(): void {
    this.server.emit(
      'usersAmount',
      this.stateService.getRegisteredUsersAmount(),
    );
    this.server.emit('lastPosts', this.stateService.getLastFourPosts());
  }
}
