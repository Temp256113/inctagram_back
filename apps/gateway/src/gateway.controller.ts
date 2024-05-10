import {
  Controller,
  Get,
  HttpException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller()
export class GatewayController {
  constructor(@Inject('AUTH_SERVICE') private authService: ClientProxy) {}

  @Get()
  async getHello() {
    const res = await lastValueFrom(
      this.authService.send('test_pattern', {
        hello: 'hello from',
      }),
    );

    console.log(res);
  }
}
