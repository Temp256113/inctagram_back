import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
  @IsString({ message: 'Username must be a string' })
  @Matches(/^[0-9A-Za-z_-]*$/, {
    message: 'Username may contain: 0-9; A-Z; a-z; _ ; -',
  })
  @Length(6, 30, { message: 'Username must contains 6 - 30 length' })
  @ApiProperty({
    description: 'The name of user',
    example: 'Temp256113',
  })
  username: string;

  @IsEmail(
    {},
    { message: 'The email must match the format example@example.com' },
  )
  @ApiProperty({
    description: 'The user email',
    example: 'email123@gmail.com',
  })
  email: string;

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

export class RegisterCodeCheckDTO {
  @IsString({ message: 'Provide register confirm code' })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email confirm code',
    example: '0b01b1f2-3227-4fec-8c7a-13c7be715f02',
  })
  code: string;
}

export class ResendRegisterEmailDto {
  @IsEmail()
  @ApiProperty({
    description: 'The user email',
    example: 'temp.256113@gmail.com',
  })
  userEmail: string;
}
