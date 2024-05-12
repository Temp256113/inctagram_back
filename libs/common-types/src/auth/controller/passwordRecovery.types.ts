import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryRequestDTO {
  @IsEmail()
  @ApiProperty({ description: 'The email of user' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  recaptchaToken: string;
}
