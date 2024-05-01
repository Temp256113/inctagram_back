import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '@libs/repositories/prisma.service';
import { CreateUserProfileDto } from '../../../../apps/first-app/src/user-profile/dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../../../../apps/first-app/src/user-profile/dto/update-user-profile.dto';

@Injectable()
export class UserProfileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createProfile(
    userId: number,
    values: Omit<CreateUserProfileDto, 'userId'>,
  ) {
    return this.prismaService.userProfile
      .create({
        data: {
          userId,
          ...values,
        },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new BadRequestException('Username already exists');
          }
        }

        throw e;
      });
  }

  async updateProfile(userId: number, values: UpdateUserProfileDto) {
    return this.prismaService.userProfile
      .update({
        where: { userId },
        data: {
          ...values,
        },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new BadRequestException('Username already exists');
          }
        }

        throw e;
      });
  }
}
