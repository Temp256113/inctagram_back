import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator(
  (cookieName: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    return cookieName ? request.cookies?.[cookieName] : request.cookies;
  },
);
