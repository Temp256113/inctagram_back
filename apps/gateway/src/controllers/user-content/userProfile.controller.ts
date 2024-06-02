import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { AccessTokenGuard, AccessTokenUserType } from '@libs/common-guards';
import * as SwaggerRouteDecorators from './swagger/index';
import { User } from '@libs/common-decorators';
import * as ControllerTypes from '@libs/common-types/user-content/controller';
import { lastValueFrom } from 'rxjs';
import { UserContentMicroservicePatterns } from './userContentMicroservice.patterns';

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
}
