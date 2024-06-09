import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();

    const authHeader = req.headers.authorization;

    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];

    if (!token) return null;

    return token;
  },
);
