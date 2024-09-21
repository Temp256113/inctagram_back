import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';

export type SideAuthSchema = AuthGatewayControllerTypes.LoginSchema & {
  refreshToken: string;
};

export type LoginSchema = AuthGatewayControllerTypes.LoginSchema & {
  refreshToken: string;
};

export type UpdateTokensPairSchema = {
  accessToken: string;
  refreshToken: string;
};

export type LogoutDTO = {
  userId: number;
  refreshTokenUuid: string;
};
