import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as UserContentGatewayControllerTypes from 'libs/common-types/src/user-content/gateway';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import {
  CreatePostCommand,
  DeletePostCommand,
  UpdatePostCommand,
} from './application/command-handlers';
import {
  GetMyPostsQuery,
  GetPostByIdQuery,
} from './application/query-handlers';
import { UserContentMicroservicePatterns } from '@libs/microservice-patterns';

//TODO перенес всю логику которая была из монолита на микросервисы
// нужно убрать сокеты и перевести на webhook сообщения про количество зареганных юзеров и последние созданные посты

// common-guards готово. guards теперь в gateway, типы остались в common-types потому что используются не только в gateway, но также и в микросервисах
// также надо перенести гарды на gateway из библиотеки потому что используются только на http протоколе, а приложение такое одно - gateway
// надо перенести из библиотеки common-decorators тоже в gateway потому что могут использоваться только на gateway (http protocol)
// типы юзеров из гардов оставить в common-types. они могут использоваться в нескольких микросервисах (по крайней мере в common-types используются эти типы)

// common-types готово. больше микросервисы не импортируют друг у друга типы, берут все из библиотеки
// также рефакторить common-types, сделать gatewayTypes, перенести типы из handlers в common-types чтобы не экспортировать типы из микросервисов
// микросервисы не должны быть связаны между собой, в том числе и типы не должны использоваться из микросервисов между собой

@Controller()
export class UserPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(UserContentMicroservicePatterns.CREATE_POST)
  async createPost(
    @Payload() payload: UserContentMicroserviceTypes.CreatePostDTO,
  ): Promise<UserContentGatewayControllerTypes.PostResponseDTO> {
    // rabbitmq для того чтобы передавать данные по очередям сериализует тип данных buffer в json
    // поэтому нужно получившийся в результате массив с числами десериализовать обратно в buffer
    payload.images.forEach((image) => {
      image.buffer = Buffer.from(image.buffer.data);
    });

    return this.commandBus.execute(
      new CreatePostCommand({
        userId: payload.userId,
        images: payload.images,
        description: payload.description,
      }),
    );
  }

  @MessagePattern(UserContentMicroservicePatterns.UPDATE_POST)
  async updatePost(
    @Payload() payload: UserContentMicroserviceTypes.UpdatePostDTO,
  ): Promise<UserContentGatewayControllerTypes.PostResponseDTO> {
    return this.commandBus.execute(
      new UpdatePostCommand({
        userId: payload.userId,
        userPostId: payload.userPostId,
        description: payload.description,
      }),
    );
  }

  @MessagePattern(UserContentMicroservicePatterns.DELETE_POST)
  async deletePost(
    @Payload() payload: UserContentMicroserviceTypes.DeletePostDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeletePostCommand({
        userPostId: payload.userPostId,
        userId: payload.userId,
      }),
    );
  }

  @MessagePattern(UserContentMicroservicePatterns.GET_MY_POSTS)
  async getMyPosts(
    @Payload() payload: UserContentMicroserviceTypes.GetMyPostsDTO,
  ): Promise<UserContentGatewayControllerTypes.PostResponseDTO[]> {
    return this.queryBus.execute(
      new GetMyPostsQuery({ userId: payload.userId, page: payload.page }),
    );
  }

  @MessagePattern(UserContentMicroservicePatterns.GET_POST_BY_ID)
  async getPostById(
    @Payload() payload: UserContentMicroserviceTypes.GetPostByIdDTO,
  ): Promise<UserContentGatewayControllerTypes.PostResponseDTO> {
    return this.queryBus.execute(
      new GetPostByIdQuery({
        postId: payload.postId,
        accessToken: payload.accessToken,
      }),
    );
  }
}
