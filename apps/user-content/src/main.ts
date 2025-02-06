import { NestFactory } from '@nestjs/core';
import { UserContentModule } from './user-content.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserContentModule,
    {
      transport: Transport.RMQ,
      options: {
        queue: 'user_content_queue',
        urls: [process.env.RABBITMQ_URL],
      },
    },
  );

  await app.listen();
}

bootstrap();
