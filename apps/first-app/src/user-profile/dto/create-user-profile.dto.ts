import { IsNotEmpty, IsString, Length } from 'class-validator';
import { BaseUserProfileDto } from './base-user-profile.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserProfileDto extends BaseUserProfileDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 30, { message: 'Username must contains 6 - 30 length' })
  @ApiProperty({ example: 'test username' })
  username: string;

  @Length(1, 50, { message: 'FirstName must contains 1 - 50 length' })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'test firstname' })
  firstName: string;

  @Length(1, 50, { message: 'LastName must contains 1 - 50 length' })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'test lastname' })
  lastName: string;
}
