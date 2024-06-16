import { Prisma } from '@prisma/client';

export type RefreshTokenUserType = {
  user: Prisma.UserGetPayload<{
    include: {
      emailInfo: true;
      profile: { include: { profileImage: true } };
    };
  }>;
  refreshTokenUuid: string;
};
