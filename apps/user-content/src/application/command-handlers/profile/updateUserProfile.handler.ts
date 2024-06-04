import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FileResource } from '@prisma/client';
import { differenceInYears } from 'date-fns';
import { HttpStatus } from '@nestjs/common';
import {
  UserProfileRepository,
  UserProfileUpdateDbDTO,
} from '@libs/repositories/repos/userProfile.repository';
import {
  UpdateUserProfileDTO,
  UserProfileResponseGatewayDTO,
} from '@libs/common-types/user-content/controller';
import { CustomRpcException } from '@libs/common-exceptions';
import { S3StorageService } from '../../../infrastructure/s3-storage/s3Storage.service';
import _ from 'lodash';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';

export type UpdateUserProfileServiceDTO = UpdateUserProfileDTO & {
  newProfileImage?: Express.Multer.File & { buffer: any };
  currentProfileImage?: FileResource | null;
  currentProfileImageId?: number | null;
  userId: number;
};

export class UpdateUserProfileCommand {
  constructor(public readonly data: UpdateUserProfileServiceDTO) {}
}

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements
    ICommandHandler<UpdateUserProfileCommand, UserProfileResponseGatewayDTO>
{
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userProfileQueryRepository: UserProfileQueryRepository,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async execute(
    command: UpdateUserProfileCommand,
  ): Promise<UserProfileResponseGatewayDTO> {
    const dateOfBirth = command.data.dateOfBirth;
    const newProfileImage = command.data.newProfileImage;
    const userId = command.data.userId;
    const username = command.data.username;

    if (dateOfBirth) {
      this.checkAge(dateOfBirth);
    }

    if (username) {
      await this.checkUsernameIsAvailable(username);
    }

    const profileUpdateDTO: UserProfileUpdateDbDTO = _.omitBy(
      {
        username,
        firstName: command.data.firstName,
        lastName: command.data.lastName,
        dateOfBirth: command.data.dateOfBirth,
        country: command.data.country,
        city: command.data.city,
        aboutMe: command.data.aboutMe,
      },
      _.isNil,
    );

    if (!newProfileImage) {
      return this.updateAndMapProfile(userId, profileUpdateDTO);
    }

    const currentProfileImage = command.data.currentProfileImage;
    const currentProfileImageId = command.data.currentProfileImageId;

    if (currentProfileImage && currentProfileImageId) {
      await this.updateProfileImage({
        currentProfileImageData: {
          id: currentProfileImageId,
          path: currentProfileImage.path,
        },
        profileImageUpdateDTO: {
          userId,
          image: newProfileImage,
        },
      });

      return this.updateAndMapProfile(userId, profileUpdateDTO);
    }

    await this.createProfileImage({ userId, image: newProfileImage });
    return this.updateAndMapProfile(userId, profileUpdateDTO);
  }

  async createProfileImage(data: {
    userId: number;
    image: Express.Multer.File;
  }): Promise<void> {
    const newImageData = await this.s3StorageService.uploadProfileImage({
      userId: data.userId,
      image: data.image,
    });

    await this.userProfileRepository.createProfileImage({
      userId: data.userId,
      image: data.image,
      path: newImageData.path,
      url: newImageData.url,
    });
  }

  async updateProfileImage(data: {
    currentProfileImageData: {
      id: number;
      path: string;
    };
    profileImageUpdateDTO: {
      userId: number;
      image: Express.Multer.File;
    };
  }): Promise<void> {
    const newProfileImage = data.profileImageUpdateDTO.image;

    await this.s3StorageService.deleteFile(data.currentProfileImageData.path);

    const newProfileImageS3Data =
      await this.s3StorageService.uploadProfileImage({
        userId: data.profileImageUpdateDTO.userId,
        image: newProfileImage,
      });

    await this.userProfileRepository.updateProfileImage(
      data.currentProfileImageData.id,
      {
        contentType: newProfileImage.mimetype,
        size: newProfileImage.size,
        path: newProfileImageS3Data.path,
        url: newProfileImageS3Data.url,
      },
    );
  }

  async updateAndMapProfile(
    userId: number,
    updateProfileDTO: UserProfileUpdateDbDTO,
  ): Promise<UserProfileResponseGatewayDTO> {
    const userProfile = await this.userProfileRepository.updateProfile(
      userId,
      updateProfileDTO,
    );

    const userProfileMapped: UserProfileResponseGatewayDTO = {
      userId: userProfile?.userId,
      username: userProfile?.username,
      firstName: userProfile?.firstName,
      lastName: userProfile?.lastName,
      dateOfBirth: userProfile?.dateOfBirth,
      country: userProfile?.country,
      city: userProfile?.city,
      aboutMe: userProfile?.aboutMe,
      createdAt: userProfile?.createdAt,
      updatedAt: userProfile?.updatedAt,
      deletedAt: userProfile?.deletedAt,
      profileImageURL: userProfile?.profileImage?.url ?? null,
      canModify: true,
    };

    return userProfileMapped;
  }

  checkAge(dateOfBirth: Date): void {
    const age = differenceInYears(new Date(), dateOfBirth);

    if (age < 13) {
      throw new CustomRpcException({
        message: 'A user under 13 cannot create a profile',
        status: HttpStatus.FORBIDDEN,
      });
    }
  }

  async checkUsernameIsAvailable(username: string): Promise<void> {
    const foundUser =
      await this.userProfileQueryRepository.getProfileByUsername(username);

    if (foundUser) {
      throw new CustomRpcException({
        message: `Username ${username} is already exists`,
        status: HttpStatus.FORBIDDEN,
      });
    }
  }
}
