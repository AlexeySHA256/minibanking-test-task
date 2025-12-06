import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthPayload } from '../types';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: AuthPayload }>();
    return request.user;
  },
);
