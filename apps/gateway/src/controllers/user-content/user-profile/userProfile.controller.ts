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
import { AccessTokenGuard, AccessTokenUserType } from '@libs/common-guards';
import * as SwaggerRouteDecorators from './swagger';
import { AccessToken, User } from '@libs/common-decorators';
import * as ControllerTypes from '@libs/common-types/user-content/controller';
import { lastValueFrom } from 'rxjs';
import { UserContentMicroservicePatterns } from '../userContentMicroservice.patterns';
import { FilesInterceptor } from '@nestjs/platform-express';
import _ from 'lodash';
import { UpdateUserProfileServiceDTO } from '../../../../../user-content/src/user-profile/application/command-handlers';

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
  ): Promise<ControllerTypes.UserProfileResponseGatewayDTO> {
    const userProfile: ControllerTypes.UserProfileResponseGatewayDTO =
      await lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.GET_MY_USER_PROFILE,
          user,
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
  ): Promise<ControllerTypes.UserProfileResponseGatewayDTO> {
    const userProfile: ControllerTypes.UserProfileResponseGatewayDTO =
      await lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.GET_USER_PROFILE_BY_ID,
          { accessToken, profileId },
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
    @Body() updateProfileDTO: ControllerTypes.UpdateUserProfileDTO,
    @User() user: AccessTokenUserType,
  ): Promise<ControllerTypes.UserProfileResponseGatewayDTO> {
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

    const dataForProfileUpdate: UpdateUserProfileServiceDTO = {
      userId: user.id,
      newProfileImage: newProfileImage[0] as Express.Multer.File,
      currentProfileImage: user?.profile?.profileImage,
      currentProfileImageId: user?.profile?.profileImage?.id,
      ...updateProfileDTO,
    };

    const updatedProfile: ControllerTypes.UserProfileResponseGatewayDTO =
      await lastValueFrom(
        this.userContentClient.send(
          UserContentMicroservicePatterns.UPDATE_USER_PROFILE,
          dataForProfileUpdate,
        ),
      );

    return updatedProfile;
  }
}
