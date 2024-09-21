import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipeBuilder,
  Patch,
  UnprocessableEntityException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import * as SwaggerRouteDecorators from './swagger';
import { lastValueFrom } from 'rxjs';
import { FilesInterceptor } from '@nestjs/platform-express';
import _ from 'lodash';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import { AccessTokenGuard } from '../../../guards/accessToken.guard';
import { AccessTokenUserType } from '@libs/common-types/guards/accessToken.guard.types';
import { User } from '../../../decorators/user.decorator';
import { AccessToken } from '../../../decorators/accessToken.decorator';
import { UserContentMicroservicePatterns } from '@libs/microservice-patterns';

@Controller('user-profile')
@ApiTags('user profile controller')
export class UserProfileController {
  constructor(
    @Inject('USER_CONTENT_SERVICE') private userContentClient: ClientProxy,
  ) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.GetUserProfile()
  async getMyProfile(
    @User() user: AccessTokenUserType,
  ): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    const getMyProfilePayload: UserContentMicroserviceTypes.GetMyProfileDTO =
      user;

    const userProfile: Promise<UserContentGatewayControllerTypes.ProfileSchema> =
      lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.GET_MY_PROFILE,
          getMyProfilePayload,
        ),
      );

    return userProfile;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SwaggerRouteDecorators.GetUserProfileById()
  async getProfileById(
    @Param('id') profileId: number,
    @AccessToken() accessToken: string | null,
  ): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    const getProfileByIdPayload: UserContentMicroserviceTypes.GetProfileByIdDTO =
      {
        profileId,
        accessToken,
      };

    const userProfile: Promise<UserContentGatewayControllerTypes.ProfileSchema> =
      lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.GET_PROFILE_BY_ID,
          getProfileByIdPayload,
        ),
      );

    return userProfile;
  }

  @Patch()
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('profileImage'))
  @SwaggerRouteDecorators.UpdateUserProfile()
  async updateProfile(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 500000,
          message: `The photo must be less than or equal 0,5 Mb and have JPEG or PNG format`,
        })
        .addFileTypeValidator({ fileType: '.(png|jpeg)' })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          exceptionFactory: () => {
            throw new UnprocessableEntityException(
              `The photo must be less than or equal 0,5 Mb and have JPEG or PNG format`,
            );
          },
        }),
    )
    newProfileImage: Express.Multer.File[],
    @Body()
    updateProfileDTO: UserContentGatewayControllerTypes.UpdateUserProfileDTO,
    @User() user: AccessTokenUserType,
  ): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    if (newProfileImage?.length > 1) {
      throw new BadRequestException(
        'You can set no more than 1 photo as a profile picture',
      );
    }

    const noDataProvided =
      _.isEmpty(updateProfileDTO) && newProfileImage.length < 1;

    if (noDataProvided) {
      throw new BadRequestException(
        'You need provide some profile properties or image for update',
      );
    }

    const updateProfilePayload: UserContentMicroserviceTypes.UpdateProfileDTO =
      {
        userId: user.id,
        newProfileImage: newProfileImage[0],
        currentProfileImage: user?.profile?.profileImage,
        ...updateProfileDTO,
      };

    const updatedProfile: Promise<UserContentGatewayControllerTypes.ProfileSchema> =
      lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.UPDATE_PROFILE,
          updateProfilePayload,
        ),
      );

    return updatedProfile;
  }
}
