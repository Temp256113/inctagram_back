import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SideAuthDto {
  @IsString({ message: 'Provide auth code' })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Code from api',
  })
  code: string;
}
