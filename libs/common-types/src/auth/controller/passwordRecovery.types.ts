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

export class PasswordRecoveryCodeCheckDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: `Password recovery code from link on email`,
    example: '0b01b1f2-3227-4fec-8c7a-13c7be715f02',
  })
  passwordRecoveryCode: string;
}
