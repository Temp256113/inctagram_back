import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UnprocessableEntityException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UserContentMicroservicePatterns } from '../userContentMicroservice.patterns';
import * as UserContentGatewayControllerTypes from 'libs/common-types/src/user-content/gateway';
import * as SwaggerRouteDecorators from './swagger';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import { AccessTokenGuard } from '../../../guards/accessToken.guard';
import { AccessTokenUserType } from '@libs/common-types/guards/accessToken.guard.types';
import { User } from '../../../decorators/user.decorator';
import { AccessToken } from '../../../decorators/accessToken.decorator';

@ApiTags('user-posts controller')
@Controller('user-posts')
export class PostsController {
  constructor(
    @Inject('USER_CONTENT_SERVICE') private userContentClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images', 10))
  @SwaggerRouteDecorators.CreateUserPost()
  createPost(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 500000,
          message: `The photo(s) must be less than or equal 0,5 Mb and have JPEG or PNG format`,
        })
        .addFileTypeValidator({ fileType: '.(png|jpeg)' })
        .build({
          fileIsRequired: true,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          exceptionFactory: () => {
            throw new UnprocessableEntityException(
              `The photo(s) must be less than or equal 0,5 Mb and have JPEG or PNG format`,
            );
          },
        }),
    )
    postImages: Express.Multer.File[],
    @Body() createPostDto: UserContentGatewayControllerTypes.CreatePostDTO,
    @User() user: AccessTokenUserType,
  ): Promise<UserContentGatewayControllerTypes.PostResponseDTO> {
    const createPostPayload: UserContentMicroserviceTypes.CreatePostDTO = {
      userId: user.id,
      images: postImages,
      description: createPostDto.description,
    };

    const post: Promise<UserContentGatewayControllerTypes.PostResponseDTO> =
      lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.CREATE_POST,
          createPostPayload,
        ),
      );

    return post;
  }

  @Patch()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.UpdateUserPost()
  async updatePost(
    @Body() updatePostDto: UserContentGatewayControllerTypes.UpdatePostDTO,
    @User() user: AccessTokenUserType,
  ): Promise<UserContentGatewayControllerTypes.PostResponseDTO> {
    const updatePostPayload: UserContentMicroserviceTypes.UpdatePostDTO = {
      userId: user.id,
      userPostId: updatePostDto.userPostId,
      description: updatePostDto.description,
    };

    const post: Promise<UserContentGatewayControllerTypes.PostResponseDTO> =
      lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.UPDATE_POST,
          updatePostPayload,
        ),
      );

    return post;
  }

  @Delete(':postId')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.DeletePost()
  async deletePost(
    @Param('postId') postId: number,
    @User() user: AccessTokenUserType,
  ): Promise<void> {
    const deletePostPayload: UserContentMicroserviceTypes.DeletePostDTO = {
      userPostId: postId,
      userId: user.id,
    };

    await lastValueFrom(
      this.userContentClient.send(
        UserContentMicroservicePatterns.DELETE_POST,
        deletePostPayload,
      ),
      { defaultValue: null },
    );
  }

  @Get('my-posts/:page')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.GetMyPosts()
  async getMyPosts(
    @Param('page') page: number,
    @User() user: AccessTokenUserType,
  ): Promise<UserContentGatewayControllerTypes.PostResponseDTO[]> {
    const getMyPostsPayload: UserContentMicroserviceTypes.GetMyPostsDTO = {
      userId: user.id,
      page,
    };

    const foundPosts: Promise<
      UserContentGatewayControllerTypes.PostResponseDTO[]
    > = lastValueFrom(
      this.userContentClient.send(
        UserContentMicroservicePatterns.GET_MY_POSTS,
        getMyPostsPayload,
      ),
    );

    return foundPosts;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.GetPostById()
  async getPostById(
    @Param('id') postId: number,
    @AccessToken() accessToken: string | undefined,
  ): Promise<UserContentGatewayControllerTypes.PostResponseDTO> {
    const getPostByIdPayload: UserContentMicroserviceTypes.GetPostByIdDTO = {
      postId,
      accessToken,
    };

    const foundPost: Promise<UserContentGatewayControllerTypes.PostResponseDTO> =
      lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.GET_POST_BY_ID,
          getPostByIdPayload,
        ),
      );

    return foundPost;
  }
}
