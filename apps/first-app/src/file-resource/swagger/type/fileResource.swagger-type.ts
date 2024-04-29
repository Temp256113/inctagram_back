import { ApiProperty } from '@nestjs/swagger';
import { FileResourceTypes } from '@prisma/client';

export class FileResourceSwaggerType {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ enum: FileResourceTypes })
  type: FileResourceTypes;

  @ApiProperty({ example: 'text/html' })
  contentType: string;

  @ApiProperty({ example: 1234, required: false })
  size: number;

  @ApiProperty({ example: 'users/1/profileImage' })
  path: string;

  @ApiProperty({ example: 1 })
  createdById: number;

  @ApiProperty({ example: 'https/yandex/users/1/profileImage' })
  url: number;

  @ApiProperty({ example: 'metadata', required: false })
  metadata: string;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: string;
}
