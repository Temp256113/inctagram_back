import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProfileSchema } from '@libs/common-types/user-content/gateway';

export class SideAuthDTO {
  @IsString({ message: 'Provide auth code' })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Code from api',
  })
  code: string;
}

export class LoginSchema {
  @ApiProperty({
    description: 'Access token. Save it',
    example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    type: 'string',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User profile',
    type: ProfileSchema,
  })
  userProfile: ProfileSchema;
}

export class UpdateTokensPairSchema {
  @ApiProperty({
    description: 'Access token. Save it',
    example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    type: 'string',
  })
  accessToken: string;
}

export class LoginDTO {
  @IsEmail(
    {},
    { message: 'The email or password are incorrect. Try again please' },
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
      message: 'The email or password are incorrect. Try again please',
    },
  )
  @Length(6, 20, {
    message: 'The email or password are incorrect. Try again please',
  })
  @ApiProperty({
    description: `The user password`,
    example: 'temp256113Ac$',
  })
  password: string;
}
