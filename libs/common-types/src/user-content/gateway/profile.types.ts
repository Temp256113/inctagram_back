import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsDateCustomValidator } from '../../../../../apps/gateway/src/custom-validators/isDateCustomValidator';
import { AccountTypes } from '@prisma/client';

class BaseUserProfileDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'SunRise' })
  username?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Jhon' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Snow' })
  lastName?: string;

  @IsDateCustomValidator()
  @IsOptional()
  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'German' })
  country?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'London' })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Info' })
  aboutMe?: string;
}

class UserAccountType {
  @ApiProperty({ example: 'Personal' })
  accountType: AccountTypes;

  @ApiProperty({ type: 'boolean', example: false })
  autoRenewal: boolean;

  @ApiProperty({ type: 'string', example: '2024-02-03T09:19:30.434Z' })
  expireAt: Date;

  @ApiProperty({ type: 'string', example: '2024-02-03T09:19:30.434Z' })
  nextPayment: Date;
}

export class ProfileSchema extends BaseUserProfileDTO {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date;

  @ApiProperty({ example: 'url' })
  profileImageURL?: string;

  @ApiProperty({ type: 'boolean', example: true })
  canModify: boolean;

  @ApiProperty()
  userAccountType: UserAccountType;
}

export class UpdateUserProfileDTO extends BaseUserProfileDTO {}
