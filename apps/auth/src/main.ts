import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.RMQ,
      options: {
        queue: 'auth_queue',
        urls: [process.env.RABBITMQ_URL],
      },
    },
  );

  await app.listen();
}

bootstrap();
