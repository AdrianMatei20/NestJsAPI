import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { User } from "src/resources/user/entities/user.entity";
import { UserDto } from "src/resources/user/dto/user.dto";

@Injectable()
export class SessionSerializer extends PassportSerializer {

    constructor(private readonly authService: AuthService) {
        super();
    }

    serializeUser(user: User, done: (err: Error, user: {id: string}) => void) {
        done(null, { id: user.id });
    }

    async deserializeUser(payload: {id: string}, done: (err: Error, user: UserDto) => void) {
        const user = await this.authService.findById(payload.id);
        return user ? done(null, user) : done(null, null);
    }

}