import { NestFactory } from '@nestjs/core';
import { WebhooksModule } from './webhooks.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WebhooksModule,
    {
      transport: Transport.RMQ,
      options: {
        queue: 'webhooks_queue',
        urls: [process.env.RABBITMQ_URL],
      },
    },
  );

  await app.listen();
}

bootstrap();
