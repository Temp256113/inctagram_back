import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { GatewayExceptionsFilter } from './gatewayExceptionsFilter';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new GatewayExceptionsFilter(httpAdapter));

  const port = 4000;

  await app.listen(port).then(() => {
    console.log(`server started on http://localhost:${port}`);
  });
}
bootstrap();
