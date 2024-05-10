import { Module } from '@nestjs/common';
import { JwtTokensService } from '@libs/jwt-token/jwt-tokens.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  providers: [JwtTokensService],
  exports: [JwtTokensService],
})
export class JwtTokensModule {}
