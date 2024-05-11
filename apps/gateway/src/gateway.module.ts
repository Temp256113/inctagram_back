import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EnvModule } from '@libs/config';
import { AuthController } from './controllers/auth.controller';
import { JwtTokensModule } from '@libs/jwt-token';
import { CommonGuardsModule } from '@libs/common-guards';

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
    ]),
  ],
  controllers: [AuthController],
  providers: [],
})
export class GatewayModule {}
