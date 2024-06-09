import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserContentMicroservicePatterns } from '../../../gateway/src/controllers/user-content/userContentMicroservice.patterns';
import * as GatewayControllerTypes from '@libs/common-types/user-content/controller';
import {
  CreateUserPostCommand,
  CreateUserPostServiceDTO,
  DeleteUserPostCommand,
  DeleteUserPostServiceDTO,
  UpdateUserPostCommand,
  UpdateUserPostServiceDTO,
} from './application/command-handlers';
import {
  GetMyUserPostsQuery,
  GetMyUserPostsServiceDTO,
} from './application/query-handlers/getMyPosts.handler';

@Controller()
export class UserPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(UserContentMicroservicePatterns.CREATE_USER_POST)
  async createPost(
    @Payload() payload: CreateUserPostServiceDTO,
  ): Promise<GatewayControllerTypes.UserPostResponseDTO> {
    // rabbitmq для того чтобы передавать данные по очередям сериализует тип данных buffer в json
    // поэтому нужно получившийся в результате массив с числами десериализовать обратно в buffer
    payload.images.forEach((image) => {
      image.buffer = Buffer.from(image.buffer.data);
    });

    return this.commandBus.execute(
      new CreateUserPostCommand({
        userId: payload.userId,
        images: payload.images,
        description: payload.description,
      }),
    );
  }

  @MessagePattern(UserContentMicroservicePatterns.UPDATE_USER_POST)
  async updatePost(@Payload() payload: UpdateUserPostServiceDTO) {
    return this.commandBus.execute(
      new UpdateUserPostCommand({
        userId: payload.userId,
        userPostId: payload.userPostId,
        description: payload.description,
      }),
    );
  }

  @MessagePattern(UserContentMicroservicePatterns.DELETE_USER_POST)
  async deletePost(
    @Payload() payload: DeleteUserPostServiceDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteUserPostCommand({
        userPostId: payload.userPostId,
        userId: payload.userId,
      }),
    );
  }

  @MessagePattern(UserContentMicroservicePatterns.GET_MY_USER_POSTS)
  async getMyPosts(
    @Payload() payload: GetMyUserPostsServiceDTO,
  ): Promise<GatewayControllerTypes.UserPostResponseDTO[]> {
    return this.queryBus.execute(
      new GetMyUserPostsQuery({ userId: payload.userId, page: payload.page }),
    );
  }
}
