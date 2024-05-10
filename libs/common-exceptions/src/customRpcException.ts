import { RpcException } from '@nestjs/microservices';

export class CustomRpcException extends RpcException {
  constructor(error: { message: string; status: number }) {
    super({ ...error, isMyCustomRpcException: true });
  }
}
