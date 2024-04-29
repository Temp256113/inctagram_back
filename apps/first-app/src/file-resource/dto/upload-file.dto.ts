import { FileResourceTypes } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UploadFileDto {
  @IsEnum(FileResourceTypes)
  type: FileResourceTypes;
}
