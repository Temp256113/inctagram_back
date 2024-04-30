import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { PrismaService } from '@libs/orm-prisma-service';

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
