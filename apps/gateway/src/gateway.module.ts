import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvModule } from '@libs/config';
import { AuthController } from './controllers/auth.controller';
import { JwtTokensModule } from '@libs/jwt-token';

@Module({
  imports: [
    EnvModule,
    JwtTokensModule,
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'auth_queue',
        },
      },
    ]),
  ],
  controllers: [GatewayController, AuthController],
  providers: [GatewayService],
})
export class GatewayModule {}
