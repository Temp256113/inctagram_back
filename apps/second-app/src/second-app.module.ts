import { Module } from '@nestjs/common';
import { SecondAppController } from './second-app.controller';
import { SecondAppService } from './second-app.service';
import { EnvModule } from '@libs/config';

@Module({
  imports: [EnvModule],
  controllers: [SecondAppController],
  providers: [SecondAppService],
})
export class SecondAppModule {}
