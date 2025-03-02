import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { GlobalRole } from "src/resources/user/enums/global-role";

@Injectable()
export class GlobalAdminGuard implements CanActivate {

    constructor() { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Unauthorized access.');
        }

        return user.globalRole === GlobalRole.ADMIN;
    }

}