import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EnvModule } from '../../../shared/config/config.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { FileResourceModule } from './file-resourse/file-resource.module';
import { UserPostsModule } from './user-posts/user-posts.module';
import { WebsocketsModule } from './websocket/websockets.module';

@Module({
  imports: [
    AuthModule,
    EnvModule,
    UserProfileModule,
    FileResourceModule,
    UserPostsModule,
    WebsocketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
