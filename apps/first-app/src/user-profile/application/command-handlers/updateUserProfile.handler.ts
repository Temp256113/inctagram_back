import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  FileResourceTypes,
  ProfileImagesKind,
  UserProfile,
} from '@prisma/client';
import { differenceInYears } from 'date-fns';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'shared/database/prisma.service';
import { FileResourceService } from 'apps/first-app/src/file-resourse/file-resource.service';
import { UserProfileRepository } from '../../repositories/user-profile.repository';
import { ProfileImageQueryRepository } from '../../repositories/query/profile-image-query.repository';
import { ProfileImageRepository } from '../../repositories/profile-image.repository';

export class UpdateUserProfileCommand {
  constructor(
    public readonly data: {
      userId: number;
      username?: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: Date;
      country?: string;
      city?: string;
      aboutMe?: string;
      fileId?: number;
    },
  ) {}
}

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand, UserProfile>
{
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly prismaService: PrismaService,
    private readonly fileResourceService: FileResourceService,
    private readonly profileImageQueryRepository: ProfileImageQueryRepository,
    private readonly profileImageRepository: ProfileImageRepository,
  ) {}

  async execute(command: UpdateUserProfileCommand) {
    const {
      data: { dateOfBirth, userId, fileId, ...values },
    } = command;

    if (dateOfBirth) {
      this.checkAge(dateOfBirth);
    }

    await this.fileResourceService.canManageFileResource({
      userId,
      fileId,
      type: FileResourceTypes.profilePhoto,
    });

    if (typeof fileId !== 'undefined') {
      const profileImage = await this.getProfileImage({ userId, fileId });

      await this.fileResourceService.delete({
        imagePath: profileImage.image.path,
        imageId: profileImage.image.id,
      });

      await this.profileImageRepository.delete({
        id: profileImage.id,
        profileId: userId,
        imageId: { not: fileId },
        kind: ProfileImagesKind.avatar,
      });

      if (fileId) {
        const existProfileImage =
          await this.profileImageQueryRepository.findFirst({
            where: {
              profileId: userId,
              imageId: { not: fileId },
              kind: ProfileImagesKind.avatar,
            },
          });

        if (!existProfileImage) {
          await this.profileImageRepository.create({
            profileId: userId,
            imageId: fileId,
            kind: ProfileImagesKind.avatar,
          });
        }
      }
    }

    return this.userProfileRepository.updateProfile(userId, {
      dateOfBirth,
      ...values,
    });
  }

  async getProfileImage({
    userId,
    fileId,
  }: {
    userId: number;
    fileId: number;
  }) {
    const profileImage = await this.profileImageQueryRepository.findFirst({
      where: {
        profileId: userId,
        imageId: { not: fileId },
        kind: ProfileImagesKind.avatar,
      },
      include: { image: true },
    });

    if (!profileImage) {
      throw new NotFoundException('User profile not found');
    }

    return profileImage;
  }

  checkAge(dateOfBirth: Date) {
    const age = differenceInYears(new Date(), dateOfBirth);

    if (age < 13) {
      throw new BadRequestException(`A user under 13 cannot create a profile`);
    }

    return true;
  }
}
