import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
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

export class PasswordRecoveryDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: `Password recovery code from link on email`,
    example: '0b01b1f2-3227-4fec-8c7a-13c7be715f02',
  })
  passwordRecoveryCode: string;

  @IsString()
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+|~\-=`{}[\]:;"'<>,.?/]).{6,}$/,
    {
      message: `Password must contain 0-9, a-z, A-Z, ! " # $ % &\n\' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _\` { | } ~`,
    },
  )
  @Length(6, 20, { message: 'Password must contains 6 - 20 length' })
  @ApiProperty({
    description: `The user password`,
    example: 'temp256113Ac$',
  })
  password: string;
}
