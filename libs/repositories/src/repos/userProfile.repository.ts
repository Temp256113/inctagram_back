import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '@libs/repositories/prisma.service';
import { RpcCustomException } from '@libs/common-exceptions';
import { FileResourceTypes } from '@prisma/client';

export type UserProfileUpdateDbDTO = Partial<{
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  country: string;
  city: string;
  aboutMe: string;
  deletedAt: string;
}>;

@Injectable()
export class UserProfileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createProfileImage(data: {
    userId: number;
    image: Express.Multer.File;
    path: string;
    url: string;
  }) {
    return this.prismaService.fileResource.create({
      data: {
        type: FileResourceTypes.profilePhoto,
        contentType: data.image.mimetype,
        size: data.image.size,
        path: data.path,
        url: data.url,
        creatorId: data.userId,
        profileId: data.userId,
      },
    });
  }

  async updateProfile(userId: number, data: UserProfileUpdateDbDTO) {
    return this.prismaService.userProfile
      .update({
        where: { userId },
        data: {
          ...data,
        },
        include: {
          profileImage: true,
        },
      })
      .catch((err) => {
        if (err instanceof PrismaClientKnownRequestError) {
          if (err.code === 'P2002') {
            throw new RpcCustomException({
              message: `Username already exists`,
              status: HttpStatus.BAD_REQUEST,
            });
          }
        }

        throw err;
      });
  }

  async updateProfileImage(
    profileImageId: number,
    data: { contentType: string; size: number; path: string; url: string },
  ) {
    return this.prismaService.fileResource.update({
      where: { id: profileImageId },
      data: {
        contentType: data.contentType,
        size: data.size,
        path: data.path,
        url: data.url,
      },
    });
  }
}
