import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {

    private secret: string = '';

    constructor(private readonly jwtService: JwtService) {
        this.secret = process.env.SECRET;
    }

    createToken(payload: object) {
        return this.jwtService.sign(payload, {
            secret: this.secret,
        });
    }

    verifyToken(token: string) {
        return this.jwtService.verify(token, {
            secret: this.secret,
        });
    }
}
