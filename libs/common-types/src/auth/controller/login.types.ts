import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type LoginReturnServiceDTO = LoginReturnGatewayDTO & {
  refreshToken: string;
};

export class LoginReturnGatewayDTO {
  @ApiProperty({
    description: 'Access token. Save it',
    example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    type: 'string',
  })
  accessToken: string;

  @ApiProperty({ example: 33, type: 'number' })
  userId: number;

  @ApiProperty({ example: 'temp256113', type: 'string' })
  username: string;
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
