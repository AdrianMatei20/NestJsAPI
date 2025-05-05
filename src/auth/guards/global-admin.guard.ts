import { CanActivate, ExecutionContext, ForbiddenException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { GlobalRole } from "src/resources/user/enums/global-role";
import { RETURN_MESSAGES } from "src/constants/return-messages";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class GlobalAdminGuard implements CanActivate {

    constructor() { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const request = ctx.getContext().req ?? context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: RETURN_MESSAGES.UNAUTHORIZED,
            });
        }

        if (user.globalRole !== GlobalRole.ADMIN) {
            throw new ForbiddenException({
                statusCode: HttpStatus.FORBIDDEN,
                message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
            });
        }

        return true;
    }

}