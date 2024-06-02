import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { AccessTokenGuard, AccessTokenUserType } from '@libs/common-guards';
import * as SwaggerRouteDecorators from './swagger/index';
import { User } from '@libs/common-decorators';
import * as ControllerTypes from '@libs/common-types/user-content/controller';
import { lastValueFrom } from 'rxjs';

@Controller('user-profile')
@ApiTags('user profile controller')
export class UserProfileController {
  constructor(
    @Inject('USER_CONTENT_SERVICE') private userContentClient: ClientProxy,
  ) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @SwaggerRouteDecorators.GetUserProfile()
  async getMyProfile(
    @User() userInfo: AccessTokenUserType,
  ): Promise<ControllerTypes.UserProfileResponseGatewayDTO> {
    const userProfile: ControllerTypes.UserProfileResponseGatewayDTO =
      await lastValueFrom(
        this.userContentClient.send('get-my-profile', userInfo),
      );

    return userProfile;
  }
}
