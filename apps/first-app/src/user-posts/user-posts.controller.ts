import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UnprocessableEntityException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@libs/common-guards';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateUserPostDto } from './dto/createUserPost.dto';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { User, UserDecoratorType } from '@libs/common-decorators';
import { CreateUserPostRouteSwaggerDescription } from './swagger/controller/createUserPost.route.swagger';
import { UpdateUserPostDto } from './dto/updateUserPost.dto';
import { UpdateUserPostRouteSwaggerDescription } from './swagger/controller/updateUserPost.route.swagger';
import {
  UserPostByIdReturnType,
  UserPostReturnType,
} from './dto/userPostReturnTypes';
import { DeleteUserPostRouteSwaggerDescription } from './swagger/controller/deleteUserPost.route.swagger';
import { UserPostsQueryRepository } from './repositories/userPosts.queryRepository';
import { GetUserPostsRouteSwaggerDescription } from './swagger/controller/getUserPosts.route.swagger';
import { AccessToken } from '@libs/common-decorators';
import { GetPostByIdQuery } from './application/query-handlers/getPostById.handler';
import { CreateUserPostCommand } from './application/command-handlers/createUserPost.handler';
import { UpdateUserPostCommand } from './application/command-handlers/updateUserPost.handler';
import { DeleteUserPostCommand } from './application/command-handlers/deleteUserPost.handler';
import { GetUserPostByIdRouteSwaggerDescription } from './swagger/controller/getUserPostById.route.swagger';

const picsErrorMessage = `The photo(s) must be less than or equal 0,5 Mb and have JPEG or PNG format`;

@ApiTags('user-posts controller')
@Controller('user-posts')
export class UserPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly userPostsQueryRepository: UserPostsQueryRepository,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10))
  @CreateUserPostRouteSwaggerDescription()
  createPost(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 500000,
          message: picsErrorMessage,
        })
        .addFileTypeValidator({ fileType: '.(png|jpeg)' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          exceptionFactory: () => {
            throw new UnprocessableEntityException(picsErrorMessage);
          },
        }),
    )
    postImages: Express.Multer.File[],
    @Body() createPostDto: CreateUserPostDto,
    @User() user: UserDecoratorType,
  ): Promise<UserPostReturnType> {
    return this.commandBus.execute(
      new CreateUserPostCommand({
        userId: user.userId,
        images: postImages,
        description: createPostDto.description,
      }),
    );
  }

  @Patch()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UpdateUserPostRouteSwaggerDescription()
  async updatePost(
    @Body() updatePostDto: UpdateUserPostDto,
    @User() user: UserDecoratorType,
  ): Promise<UserPostReturnType> {
    return this.commandBus.execute(
      new UpdateUserPostCommand({
        userPostId: updatePostDto.userPostId,
        userId: user.userId,
        description: updatePostDto.description,
      }),
    );
  }

  @Delete(':postId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteUserPostRouteSwaggerDescription()
  async deletePost(
    @Param('postId') postId: number,
    @User() user: UserDecoratorType,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteUserPostCommand({ userPostId: postId, userId: user.userId }),
    );
  }

  @Get('my-posts/:page')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @GetUserPostsRouteSwaggerDescription()
  async getMyPosts(
    @Param('page') page: number,
    @User() user: UserDecoratorType,
  ): Promise<UserPostReturnType[]> {
    return this.userPostsQueryRepository.getPostsByUserId({
      userId: user.userId,
      page,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @GetUserPostByIdRouteSwaggerDescription()
  async getPostById(
    @Param('id') postId: number,
    @AccessToken() accessToken: string | undefined,
  ): Promise<UserPostByIdReturnType> {
    return this.queryBus.execute(new GetPostByIdQuery({ postId, accessToken }));
  }
}
