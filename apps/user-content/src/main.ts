import { NestFactory } from '@nestjs/core';
import { UserContentModule } from './user-content.module';

async function bootstrap() {
  const app = await NestFactory.create(UserContentModule);
  await app.listen(3000);
}
bootstrap();
