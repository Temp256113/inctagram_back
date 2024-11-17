import { Prisma } from '@prisma/client';

export type AccessTokenUserType = Prisma.UserGetPayload<{
  include: {
    userAccountType: true;
    emailInfo: true;
    profile: { include: { profileImage: true } };
  };
}>;
