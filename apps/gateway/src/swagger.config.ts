import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { JwtTokensService } from '@libs/jwt-token';

export class SwaggerConfig {
  constructor(private readonly app: INestApplication) {}

  public apply() {
    const config = new DocumentBuilder()
      .setTitle('Inctagram api')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'To access this route you need to provide access token in the authorization header',
      })
      .addCookieAuth(JwtTokensService.refreshTokenCookieTitle, {
        type: 'http',
        in: 'cookie',
      })
      .setDescription('Inctagram api. Created by Temp256113 && ArtyomSunRise')
      .addTag('example tag')
      .build();

    const document = SwaggerModule.createDocument(this.app, config);

    SwaggerModule.setup('/api/v1/swagger', this.app, document, {
      customSiteTitle: 'deepwaterhorizon api',
    });
  }
}
