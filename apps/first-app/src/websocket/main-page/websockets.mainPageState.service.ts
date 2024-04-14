import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserPostsQueryRepository } from '../../user-posts/repositories/userPosts.queryRepository';
import { UserQueryRepository } from '../../auth/repositories/query/user.queryRepository';
import { UserPostReturnType } from '../../user-posts/dto/userPostReturnTypes';

@Injectable()
export class WebsocketsMainPageStateService implements OnModuleInit {
  constructor(
    private readonly userPostsQueryRepository: UserPostsQueryRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {}

  private registeredUsersAmount: number;
  private newCreatedPostsAmount: number;
  private lastFourPosts: UserPostReturnType[];

  async onModuleInit(): Promise<void> {
    this.newCreatedPostsAmount = 0;
    this.registeredUsersAmount =
      await this.userQueryRepository.getUsersAmount();

    await this.updateLastFourPosts();
  }

  getRegisteredUsersAmount(): number {
    return this.registeredUsersAmount;
  }

  getNewCreatedPostsAmount(): number {
    return this.newCreatedPostsAmount;
  }

  getLastFourPosts(): UserPostReturnType[] {
    return this.lastFourPosts;
  }

  increaseRegisteredUsersAmount(): number {
    this.registeredUsersAmount += 1;

    return this.registeredUsersAmount;
  }

  increaseNewCreatedPostsAmount(): number {
    this.newCreatedPostsAmount += 1;

    return this.newCreatedPostsAmount;
  }

  async updateLastFourPosts(): Promise<UserPostReturnType[]> {
    this.newCreatedPostsAmount = 0;

    this.lastFourPosts = await this.userPostsQueryRepository.getLastFourPosts();

    return this.lastFourPosts;
  }
}

// TODO: когда появятся новые 4 поста/5 зарегистрированных юзеров
// TODO: то надо отсюда вызывать какой нибудь метод из сервиса с сокетом main page
// TODO: потому что только сервис состояния знает когда надо вызывать событие чтобы отправить клиенту данные
