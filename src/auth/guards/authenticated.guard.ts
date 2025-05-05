import { CanActivate, ExecutionContext, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { RETURN_MESSAGES } from "src/constants/return-messages";

@Injectable()
export class AuthenticatedGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const request = ctx.getContext().req ?? context.switchToHttp().getRequest();

        if (!request || !request.isAuthenticated || !request.isAuthenticated()) {
            throw new UnauthorizedException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: RETURN_MESSAGES.UNAUTHORIZED,
            });
        }

        return true;
    }

}