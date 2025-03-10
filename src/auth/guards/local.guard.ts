import { ExecutionContext, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "../../../src/resources/user/user.service";
import { RETURN_MESSAGES } from "../../../src/constants/return-messages";

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {

    constructor(private readonly userService: UserService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const result = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();

        if (!request.user) {
            throw new UnauthorizedException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: RETURN_MESSAGES.UNAUTHORIZED,
            });
        }

        const user = await this.userService.findOneById(request.user.id);

        if (!user) {
            throw new NotFoundException({
                statusCode: HttpStatus.NOT_FOUND,
                message: RETURN_MESSAGES.NOT_FOUND.USER,
            });
        }

        if (!user.emailVerified) {
            throw new UnauthorizedException({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: RETURN_MESSAGES.UNAUTHORIZED,
            });
        }

        await super.logIn(request);
        return result;
    }
}