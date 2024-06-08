import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserContentMicroservicePatterns } from '../../../gateway/src/controllers/user-content/userContentMicroservice.patterns';
import * as GatewayControllerTypes from '@libs/common-types/user-content/controller';
import {
  CreateUserPostCommand,
  CreateUserPostServiceDTO,
} from './application/command-handlers/createUserPost.handler';

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
}
