import { RpcException } from '@nestjs/microservices';

export type CustomRpcExceptionDTO = {
  message: string;
  status: number;
} & Record<string, any>;

export class CustomRpcException extends RpcException {
  constructor(error: CustomRpcExceptionDTO) {
    super({ ...error, isMyCustomRpcException: true });
  }
}
