import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

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

  @IsDate()
  @IsOptional()
  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  dateOfBirth?: Date;

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

export class ProfileResponseDTO extends BaseUserProfileDTO {
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
}

export class UpdateUserProfileDTO extends BaseUserProfileDTO {}
