import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { GatewayExceptionsFilter } from './gatewayExceptionsFilter';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { useContainer, ValidationError } from 'class-validator';
import * as _ from 'lodash';
import cookieParser from 'cookie-parser';
import { SwaggerConfig } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, {
    rawBody: true,
  });

  useContainer(app.select(GatewayModule), { fallbackOnErrors: true });

  new SwaggerConfig(app).apply();

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        // эта функция написана для того чтобы не дублировать ошибки
        // которые отправляет на клиент class validator
        const constraints = validationErrors.map((error) => {
          return error.constraints;
        });

        const errors: string[] = [];

        constraints.forEach((elem) => {
          Object.entries(elem).forEach((el) => {
            errors.push(el[1]);
          });
        });

        const errorsWithoutDuplicates = _.uniq(errors);

        return new BadRequestException(errorsWithoutDuplicates);
      },
    }),
  );

  app.use(cookieParser());

  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new GatewayExceptionsFilter(httpAdapter));

  const port = Number(process.env.PORT) || 4000;

  await app.listen(port).then(() => {
    console.log(`gateway app started on http://localhost:${port}`);
  });
}

bootstrap();
