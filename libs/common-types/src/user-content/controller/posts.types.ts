import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

class UserPostImagesResponseGatewayDTO {
  @ApiProperty({ type: 'string' })
  imageUrl: string;
}

export class UserPostResponseDTO {
  @ApiProperty({ type: 'number', example: 33 })
  postId: number;

  @ApiProperty({ type: 'string' })
  postDescription?: string;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-02-03T09:19:30.434Z' })
  updatedAt: Date;

  @ApiProperty({ type: [UserPostImagesResponseGatewayDTO] })
  postImages: UserPostImagesResponseGatewayDTO[];
}

export class UserPostByIdResponseDTO extends UserPostResponseDTO {
  @ApiProperty({ type: 'boolean', example: true })
  canModify: boolean;
}

export class UpdateUserPostDTO {
  @IsString()
  @Length(1, 500, { message: 'Description field may have only 500 length' })
  @ApiProperty({
    example: 'Some post description',
    maxLength: 500,
    minLength: 1,
  })
  description: string;

  @IsNumber()
  @ApiProperty({ example: 256113, description: 'Provide valid user post id' })
  userPostId: number;
}

export class CreateUserPostDTO {
  @IsOptional()
  @IsString()
  @Length(1, 500, { message: 'Description field may have only 500 length' })
  @ApiProperty({
    example: 'Some post description',
    required: false,
    maxLength: 500,
  })
  description?: string;
}
