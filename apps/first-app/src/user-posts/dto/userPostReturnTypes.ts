import { ApiProperty } from '@nestjs/swagger';

class PostImagesType {
  @ApiProperty({ type: 'number', example: 256113 })
  imageId: number;

  @ApiProperty({ type: 'string' })
  imageUrl: string;
}

export class UserPostReturnType {
  @ApiProperty({ type: 'number', example: 33 })
  postId: number;

  @ApiProperty({ type: 'string' })
  postDescription?: string;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  updatedAt: Date;

  @ApiProperty({ type: [PostImagesType] })
  postImages: { imageId: number; imageUrl: string }[];
}

export class UserPostByIdReturnType extends UserPostReturnType {
  @ApiProperty({ type: 'boolean', example: true })
  canModify: boolean;
}
