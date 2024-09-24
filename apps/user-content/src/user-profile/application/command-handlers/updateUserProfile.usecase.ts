import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { differenceInYears, parseISO } from 'date-fns';
import { HttpStatus } from '@nestjs/common';
import {
  UserProfileRepository,
  UserProfileUpdateDbDTO,
} from '@libs/repositories/repos/userProfile.repository';
import { RpcCustomException } from '@libs/common-exceptions';
import _ from 'lodash';
import { UserProfileQueryRepository } from '@libs/repositories/query-repos/userProfile.queryRepository';
import * as UserContentGatewayControllerTypes from '@libs/common-types/user-content/gateway';
import * as UserContentMicroserviceTypes from '@libs/common-types/user-content/microservice';
import { GoogleDriveService } from '../../../infrastructure/google-drive-storage/googleDrive.service';

export class UpdateProfileCommand {
  constructor(
    public readonly data: UserContentMicroserviceTypes.UpdateProfileDTO,
  ) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateUserProfileUsecase
  implements
    ICommandHandler<
      UpdateProfileCommand,
      UserContentGatewayControllerTypes.ProfileSchema
    >
{
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userProfileQueryRepository: UserProfileQueryRepository,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async execute({
    data: dto,
  }: UpdateProfileCommand): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    const dateOfBirth = dto.dateOfBirth;
    const newProfileImage = dto.newProfileImage;
    const userId = dto.userId;
    const username = dto.username;

    if (dateOfBirth) {
      this.checkAge(dateOfBirth);
    }

    if (username) {
      await this.checkUsernameIsAvailable(username);
    }

    const profileUpdateDTO: UserProfileUpdateDbDTO = _.omitBy(
      {
        username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dto.dateOfBirth,
        country: dto.country,
        city: dto.city,
        aboutMe: dto.aboutMe,
      },
      _.isNil,
    );

    if (!newProfileImage) {
      return this.updateAndMapProfile(userId, profileUpdateDTO);
    }

    const currentProfileImage = dto.currentProfileImage;

    if (currentProfileImage) {
      await this.updateProfileImage({
        currentProfileImageData: {
          id: currentProfileImage.id,
          googleFileId: currentProfileImage.googleFileId,
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
    const newImageData = await this.googleDriveService.upload(data.image);

    await this.userProfileRepository.createProfileImage({
      userId: data.userId,
      image: data.image,
      googleFileId: newImageData.uploadedFileId,
      url: newImageData.directLink,
    });
  }

  async updateProfileImage(data: {
    currentProfileImageData: {
      id: number;
      googleFileId: string;
    };
    profileImageUpdateDTO: {
      userId: number;
      image: Express.Multer.File;
    };
  }): Promise<void> {
    const newProfileImage = data.profileImageUpdateDTO.image;

    await this.googleDriveService.deleteFile(
      data.currentProfileImageData.googleFileId,
    );

    const newImageData = await this.googleDriveService.upload(newProfileImage);

    await this.userProfileRepository.updateProfileImage(
      data.currentProfileImageData.id,
      {
        contentType: newProfileImage.mimetype,
        size: newProfileImage.size,
        googleFileId: newImageData.uploadedFileId,
        url: newImageData.directLink,
      },
    );
  }

  async updateAndMapProfile(
    userId: number,
    updateProfileDTO: UserProfileUpdateDbDTO,
  ): Promise<UserContentGatewayControllerTypes.ProfileSchema> {
    const userProfile = await this.userProfileRepository.updateProfile(
      userId,
      updateProfileDTO,
    );

    const userProfileMapped: UserContentGatewayControllerTypes.ProfileSchema = {
      userId: userProfile?.userId,
      username: userProfile?.username,
      firstName: userProfile?.firstName,
      lastName: userProfile?.lastName,
      dateOfBirth: userProfile?.dateOfBirth?.toISOString(),
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

  checkAge(dateOfBirth: string): void {
    const age = differenceInYears(new Date(), parseISO(dateOfBirth));

    if (age < 13) {
      throw new RpcCustomException({
        message: 'A user under 13 cannot create a profile',
        status: HttpStatus.FORBIDDEN,
      });
    }
  }

  async checkUsernameIsAvailable(username: string): Promise<void> {
    const foundUser =
      await this.userProfileQueryRepository.getProfileByUsername(username);

    if (foundUser) {
      throw new RpcCustomException({
        message: `Username ${username} is already exists`,
        status: HttpStatus.FORBIDDEN,
      });
    }
  }
}
