import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseGatewayDTO {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'SunRise' })
  username: string;

  @ApiProperty({ example: 'Jhon' })
  firstName: string;

  @ApiProperty({ example: 'Snow' })
  lastName: string;

  @ApiProperty({ example: '11.01.2001' })
  dateOfBirth?: Date;

  @ApiProperty({ example: 'German' })
  country?: string;

  @ApiProperty({ example: 'London' })
  city?: string;

  @ApiProperty({ example: 'Info' })
  aboutMe?: string;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date;

  @ApiProperty({ type: 'boolean', example: true })
  canModify: boolean;
}
