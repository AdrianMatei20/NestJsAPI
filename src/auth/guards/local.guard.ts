import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { UserService } from "src/resources/user/user.service";

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {

    constructor(private readonly userService: UserService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const result = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();

        if(!request.user) {
            throw new UnauthorizedException('invalid user id provided');
        }

        const user = await this.userService.findOneById(request.user.id);

        if(!user) {
            throw new NotFoundException('user not found');
        }

        if(!user.emailVerified) {
            throw new UnauthorizedException('email address not verified');
        }

        await super.logIn(request);
        return result;
    }
}