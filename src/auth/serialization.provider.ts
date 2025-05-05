import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { User } from "src/resources/user/entities/user.entity";
import { AdminUserDto } from "src/resources/user/dto/admin-user.dto";
import { CurrentUser } from "src/auth/current-user";

@Injectable()
export class SessionSerializer extends PassportSerializer {

    constructor(private readonly authService: AuthService) {
        super();
    }

    serializeUser(user: User, done: (err: Error, user: CurrentUser) => void) {
        done(null, { id: user.id, globalRole: user.globalRole });
    }

    async deserializeUser(payload: {id: string}, done: (err: Error, user: AdminUserDto) => void) {
        const user = await this.authService.findById(payload.id);
        return user ? done(null, user) : done(null, null);
    }

}