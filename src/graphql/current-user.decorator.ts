import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/resources/user/entities/user.entity';
import { CurrentUser } from '../auth/current-user';

export const CurrentUserDecorator = createParamDecorator(
  (data: unknown, context: ExecutionContext): CurrentUser => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;
    return new CurrentUser(user.id, user.globalRole);
  },
);