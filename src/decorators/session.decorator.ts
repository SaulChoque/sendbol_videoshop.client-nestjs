import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Session = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return data ? request.session?.[data] : request.session;
  },
);
