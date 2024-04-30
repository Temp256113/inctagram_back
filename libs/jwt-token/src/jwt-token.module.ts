import { Module } from '@nestjs/common';
import { TokensService } from '@libs/jwt-token/tokens.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class JwtTokenModule {}
