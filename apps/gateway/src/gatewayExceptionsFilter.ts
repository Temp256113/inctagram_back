import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GatewayExceptionsFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res: Response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).send(exception.getResponse());
    }

    if (exception.isMyCustomRpcException) {
      if (!(exception.message && exception.status)) {
        return super.catch(exception, host);
      }

      return res.status(exception.status).send({
        message: exception.message,
        status: exception.status,
      });
    }

    super.catch(exception, host);
  }
}
