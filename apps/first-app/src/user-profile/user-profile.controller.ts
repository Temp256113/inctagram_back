import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AccessTokenGuard } from '@libs/common-guards';
import { User, UserDecoratorType } from '@libs/common-decorators';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserProfileRouteSwaggerDescription } from './swagger/controller/createUserProfile.route.swagger';
import { UpdateUserProfileRouteSwaggerDescription } from './swagger/controller/updateUserProfile.route.swagger';
import { GetUserProfileRouteSwaggerDescription } from './swagger/controller/getUserProfile.route.swagger';
import { ApiTags } from '@nestjs/swagger';
import { AccessToken } from '@libs/common-decorators';
import { UserProfileByIdReturnType } from './dto/userProfileReturnTypes';
import { GetProfileByIdQuery } from './application/query-handlers/getProfileById.handler';
import { CreateUserProfileCommand } from './application/command-handlers/createUserProfile.handler';
import { UpdateUserProfileCommand } from './application/command-handlers/updateUserProfile.handler';
import { GetUserProfileByIdRouteSwaggerDescription } from './swagger/controller/getUserProfileById.route.swagger';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';

@Controller('user-profile')
@ApiTags('user profile controller')
export class UserProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly userProfileQueryRepository: UserProfileQueryRepository,
  ) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @GetUserProfileRouteSwaggerDescription()
  async findOne(@User() user: UserDecoratorType) {
    return this.userProfileQueryRepository.getProfileByUserId(user.userId, {
      profileImage: { include: { image: true } },
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @GetUserProfileByIdRouteSwaggerDescription()
  async getUserProfileById(
    @Param('id') profileId: number,
    @AccessToken() accessToken: string | undefined,
  ): Promise<UserProfileByIdReturnType> {
    return this.queryBus.execute(
      new GetProfileByIdQuery({ profileId, accessToken }),
    );
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @CreateUserProfileRouteSwaggerDescription()
  async create(
    @User() user: UserDecoratorType,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ) {
    const userProfile = await this.commandBus.execute(
      new CreateUserProfileCommand({
        userId: user.userId,
        ...createUserProfileDto,
      }),
    );

    return userProfile;
  }

  @Patch()
  @UseGuards(AccessTokenGuard)
  @UpdateUserProfileRouteSwaggerDescription()
  async update(
    @User() user: UserDecoratorType,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const userProfile = await this.commandBus.execute(
      new UpdateUserProfileCommand({
        userId: user.userId,
        ...updateUserProfileDto,
      }),
    );

    return userProfile;
  }
}
