import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  FileResourceTypes,
  ProfileImagesKind,
  UserProfile,
} from '@prisma/client';
import { differenceInYears } from 'date-fns';
import { BadRequestException } from '@nestjs/common';
import { FileResourceService } from '../../../file-resource/file-resource.service';
import { CreateUserProfileDto } from '../../dto/create-user-profile.dto';
import { UserProfileRepository } from '@libs/repositories/repos/userProfile.repository';
import { ProfileImageRepository } from '@libs/repositories/repos/profileImage.repository';

export class CreateUserProfileCommand {
  constructor(public readonly data: CreateUserProfileDto) {}
}

@CommandHandler(CreateUserProfileCommand)
export class CreateUserProfileHandler
  implements ICommandHandler<CreateUserProfileCommand, UserProfile>
{
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly profileImageRepository: ProfileImageRepository,
    private readonly fileResourceService: FileResourceService,
  ) {}

  async execute(command: CreateUserProfileCommand) {
    const {
      data: { dateOfBirth, userId, fileId, ...values },
    } = command;

    this.checkAge(dateOfBirth);

    const profile = await this.userProfileRepository.createProfile(userId, {
      dateOfBirth,
      ...values,
    });

    if (fileId) {
      await this.fileResourceService.canManageFileResource({
        userId,
        fileId,
        type: FileResourceTypes.profilePhoto,
      });

      await this.profileImageRepository.create({
        profileId: userId,
        imageId: fileId,
        kind: ProfileImagesKind.avatar,
      });
    }

    return profile;
  }

  checkAge(dateOfBirth: Date) {
    const age = differenceInYears(new Date(), dateOfBirth);

    if (age < 13) {
      throw new BadRequestException(`A user under 13 cannot create a profile`);
    }

    return true;
  }
}
