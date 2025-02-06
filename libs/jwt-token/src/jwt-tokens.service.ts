import { ConfigService, ConfigType } from '@nestjs/config';
import appConfig from '@libs/config/app.config.service';
import { Inject, Injectable } from '@nestjs/common';
import { add, getUnixTime } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

export type AccessTokenPayloadType = {
  userId: number;
  username: string;
  iat?: number;
  exp?: number;
};

export type RefreshTokenPayloadType = {
  userId: number;
  username: string;
  uuid: string;
  iat?: number;
  exp?: number;
};

export type RefreshTokenCreateType = {
  token: string;
  payload: RefreshTokenPayloadType;
};

@Injectable()
export class JwtTokensService {
  public static readonly refreshTokenCookieTitle = 'refreshToken';

  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  private readonly getAccessTokenExpiredTime: (currentDate: Date) => number;
  private readonly getRefreshTokenExpiredTime: (currentDate: Date) => number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecret = this.config.ACCESS_TOKEN_SECRET;
    this.refreshTokenSecret = this.config.REFRESH_TOKEN_SECRET;

    this.getAccessTokenExpiredTime = (currentDate: Date) => {
      return getUnixTime(add(currentDate, { minutes: 15 }));
    };
    this.getRefreshTokenExpiredTime = (currentDate: Date) => {
      return getUnixTime(add(currentDate, { months: 3 }));
    };
  }

  async createAccessToken(data: {
    userId: number;
    username: string;
  }): Promise<string> {
    const { userId, username } = data;

    const currentDate: Date = new Date();

    const payload: AccessTokenPayloadType = {
      userId,
      username,
      iat: getUnixTime(currentDate),
      exp: this.getAccessTokenExpiredTime(currentDate),
    };

    return this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
    });
  }

  async createRefreshToken(data: {
    userId: number;
    username: string;
    uuid: string;
  }): Promise<RefreshTokenCreateType> {
    const { userId, username, uuid } = data;

    const currentDate: Date = new Date();

    const payload: RefreshTokenPayloadType = {
      userId,
      username,
      uuid,
      iat: getUnixTime(currentDate),
      exp: this.getRefreshTokenExpiredTime(currentDate),
    };

    const refreshToken: string = await this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
    });

    return {
      payload: payload,
      token: refreshToken,
    };
  }

  setRefreshTokenInCookie(data: { refreshToken: string; res: Response }): void {
    const { refreshToken, res } = data;

    // так как в JWT токене время в секундах, то его надо перевести в миллисекунды
    const expiresDate: Date = new Date(
      this.getTokenPayload(refreshToken).exp * 1000,
    );

    res.cookie(JwtTokensService.refreshTokenCookieTitle, refreshToken, {
      httpOnly: true,
      secure: true,
      expires: expiresDate,
      sameSite: 'none',
    });
  }

  removeRefreshTokenInCookie(res: Response) {
    res.cookie(JwtTokensService.refreshTokenCookieTitle, null, {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    });
  }

  async createTokensPair(data: {
    userId: number;
    username: string;
    uuid: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, username, uuid } = data;

    const [accessToken, refreshToken]: [string, RefreshTokenCreateType] =
      await Promise.all([
        this.createAccessToken({ userId, username }),
        this.createRefreshToken({ userId, username, uuid }),
      ]);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  getTokenPayload<T extends AccessTokenPayloadType | RefreshTokenPayloadType>(
    token: string,
  ): T {
    return this.jwtService.decode(token);
  }

  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayloadType | null> {
    try {
      const refreshTokenPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.refreshTokenSecret,
          ignoreExpiration: false,
        },
      );

      return refreshTokenPayload;
    } catch (err) {
      return null;
    }
  }

  async verifyAccessToken(
    accessToken: string,
  ): Promise<AccessTokenPayloadType | null> {
    try {
      const accessTokenPayload = await this.jwtService.verifyAsync(
        accessToken,
        {
          secret: this.accessTokenSecret,
          ignoreExpiration: false,
        },
      );

      return accessTokenPayload;
    } catch (err) {
      return null;
    }
  }
}
