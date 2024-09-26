import { UpdateUserProfileDTO } from '@libs/common-types/user-content/gateway';
import { FileResource } from '@prisma/client';
import { AccessTokenUserType } from '@libs/common-types/guards/accessToken.guard.types';

export type UpdateProfileDTO = UpdateUserProfileDTO & {
  newProfileImage?: Express.Multer.File & { buffer: any };
  currentProfileImage?: FileResource | null;
  userId: number;
};

export type GetProfileByIdDTO = {
  accessToken: string | null;
  profileId: number;
};

export type GetMyProfileDTO = AccessTokenUserType;
