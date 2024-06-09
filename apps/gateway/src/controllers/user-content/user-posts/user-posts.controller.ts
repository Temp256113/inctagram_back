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
import { AccessTokenGuard, AccessTokenUserType } from '@libs/common-guards';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AccessToken, User } from '@libs/common-decorators';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UserContentMicroservicePatterns } from '../userContentMicroservice.patterns';
import {
  CreateUserPostServiceDTO,
  DeleteUserPostServiceDTO,
} from '../../../../../user-content/src/user-posts/application/command-handlers';
import * as GatewayControllerTypes from '@libs/common-types/user-content/controller';
import * as SwaggerRouteDecorators from './swagger';
import { UpdateUserPostServiceDTO } from '../../../../../user-content/src/user-posts/application/command-handlers';
import {
  GetMyUserPostsServiceDTO,
  GetUserPostByIdServiceDTO,
} from '../../../../../user-content/src/user-posts/application/query-handlers';

@ApiTags('user-posts controller')
@Controller('user-posts')
export class UserPostsController {
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
    @Body() createPostDto: GatewayControllerTypes.CreateUserPostDTO,
    @User() user: AccessTokenUserType,
  ): Promise<GatewayControllerTypes.UserPostResponseDTO> {
    const createUserPostPayload: CreateUserPostServiceDTO = {
      userId: user.id,
      images: postImages,
      description: createPostDto.description,
    };

    return lastValueFrom(
      this.userContentClient.send(
        UserContentMicroservicePatterns.CREATE_USER_POST,
        createUserPostPayload,
      ),
    );
  }

  @Patch()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.UpdateUserPost()
  async updatePost(
    @Body() updatePostDto: GatewayControllerTypes.UpdateUserPostDTO,
    @User() user: AccessTokenUserType,
  ): Promise<GatewayControllerTypes.UserPostResponseDTO> {
    const updateUserPostPayload: UpdateUserPostServiceDTO = {
      userId: user.id,
      userPostId: updatePostDto.userPostId,
      description: updatePostDto.description,
    };

    return lastValueFrom(
      this.userContentClient.send(
        UserContentMicroservicePatterns.UPDATE_USER_POST,
        updateUserPostPayload,
      ),
    );
  }

  @Delete(':postId')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerRouteDecorators.DeleteUserPost()
  async deletePost(
    @Param('postId') postId: number,
    @User() user: AccessTokenUserType,
  ): Promise<void> {
    const deleteUserPostPayload: DeleteUserPostServiceDTO = {
      userPostId: postId,
      userId: user.id,
    };

    await lastValueFrom(
      this.userContentClient.send(
        UserContentMicroservicePatterns.DELETE_USER_POST,
        deleteUserPostPayload,
      ),
      { defaultValue: null },
    );
  }

  @Get('my-posts/:page')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.GetUserPosts()
  async getMyPosts(
    @Param('page') page: number,
    @User() user: AccessTokenUserType,
  ): Promise<GatewayControllerTypes.UserPostResponseDTO[]> {
    const getMyUserPostsPayload: GetMyUserPostsServiceDTO = {
      userId: user.id,
      page,
    };

    return lastValueFrom(
      this.userContentClient.send(
        UserContentMicroservicePatterns.GET_MY_USER_POSTS,
        getMyUserPostsPayload,
      ),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.GetUserPostById()
  async getPostById(
    @Param('id') postId: number,
    @AccessToken() accessToken: string | undefined,
  ): Promise<GatewayControllerTypes.UserPostResponseDTO> {
    const getUserPostByIdPayload: GetUserPostByIdServiceDTO = {
      postId,
      accessToken,
    };

    return lastValueFrom(
      this.userContentClient.send(
        UserContentMicroservicePatterns.GET_USER_POST_BY_ID,
        getUserPostByIdPayload,
      ),
    );
  }
}
