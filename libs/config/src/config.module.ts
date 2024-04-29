import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config.service';
import authConfig from './auth.config.service';

export const EnvModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [appConfig, authConfig],
});
