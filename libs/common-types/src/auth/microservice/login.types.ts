import * as AuthGatewayControllerTypes from '@libs/common-types/auth/gateway';

export type SideAuthResponseDTO =
  AuthGatewayControllerTypes.LoginResponseDTO & {
    refreshToken: string;
  };

export type LoginResponseDTO = AuthGatewayControllerTypes.LoginResponseDTO & {
  refreshToken: string;
};

export type UpdateTokensPairResponseDTO = {
  accessToken: string;
  refreshToken: string;
};

export type LogoutDTO = {
  userId: number;
  refreshTokenUuid: string;
};
