import { Prisma } from '@prisma/client';

export type AccessTokenUserType = Prisma.UserGetPayload<{
  include: {
    emailInfo: true;
    profile: { include: { profileImage: true } };
  };
}>;
