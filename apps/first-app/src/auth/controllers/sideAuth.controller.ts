import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Response,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { SideAuthRouteSwaggerDescription } from '../swagger/controllers/sideAuth/sideAuth.route.swagger';
import { Cookies } from '../decorators/cookies.decorator';
import { SideAuthDto } from '../dto/sideAuth.dto';
import { Response as Res } from 'express';
import { SideAuthResponseType } from '../dto/response/sideAuth.responseType';
import { GoogleAuthCommand } from '../application/command-handlers/googleAuth.handler';
import { GithubAuthCommand } from '../application/command-handlers/githubAuth.handler';
import { TokensVariables } from '@libs/jwt-token';

@Controller('auth')
@ApiTags('auth controller')
export class SideAuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('google-auth')
  @HttpCode(HttpStatus.OK)
  @SideAuthRouteSwaggerDescription()
  async authViaGoogle(
    @Cookies(TokensVariables.REFRESH_TOKEN_COOKIE_TITLE)
    refreshToken: string | undefined,
    @Body() googleAuthCode: SideAuthDto,
    @Response({ passthrough: true }) res: Res,
  ): Promise<SideAuthResponseType> {
    const userInfo: SideAuthResponseType = await this.commandBus.execute(
      new GoogleAuthCommand({
        googleCode: googleAuthCode.code,
        res,
        refreshToken,
      }),
    );

    return userInfo;
  }

  @Post('github-auth')
  @HttpCode(HttpStatus.OK)
  @SideAuthRouteSwaggerDescription()
  async authViaGithub(
    @Cookies(TokensVariables.REFRESH_TOKEN_COOKIE_TITLE)
    refreshToken: string | undefined,
    @Body() githubAuthCode: SideAuthDto,
    @Response({ passthrough: true }) res: Res,
  ): Promise<SideAuthResponseType> {
    const userInfo: SideAuthResponseType = await this.commandBus.execute(
      new GithubAuthCommand({
        githubCode: githubAuthCode.code,
        res,
        refreshToken,
      }),
    );

    return userInfo;
  }
}
