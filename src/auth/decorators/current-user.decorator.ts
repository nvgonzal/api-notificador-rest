import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../entity/user.entity';

export const CurrentUser = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    return data ? user?.[data] : user;
  },
);
