import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvModule } from '@libs/config';
import { JwtTokensModule } from '@libs/jwt-token';
import { CommonGuardsModule } from '@libs/common-guards';
import { AuthController } from './controllers/auth/auth.controller';
import { UserProfileController } from './controllers/user-content/user-profile/userProfile.controller';

const userContentControllers = [UserProfileController];

@Module({
  imports: [
    EnvModule,
    JwtTokensModule,
    CommonGuardsModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'auth_queue',
        },
      },
      {
        name: 'USER_CONTENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'user_content_queue',
        },
      },
    ]),
  ],
  controllers: [AuthController, ...userContentControllers],
  providers: [],
})
export class GatewayModule {}
