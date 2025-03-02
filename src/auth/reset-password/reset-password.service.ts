import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResetPassword } from './reset-password.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/resources/user/user.service';
import { TokenService } from 'src/services/token/token.service';

@Injectable()
export class ResetPasswordService {

    constructor(
        @InjectRepository(ResetPassword)
        private readonly resetPasswordRepository: Repository<ResetPassword>,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) { }

    async createResetToken(userId: string): Promise<string> {
        const user = await this.userService.findOneById(userId);
        const payload = { id: user.id, email: user.email };
        const token = this.tokenService.createToken(payload);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

        const resetPassword = this.resetPasswordRepository.create({
            user,
            token,
            expiresAt,
        });

        await this.resetPasswordRepository.save(resetPassword);
        return token;
    }

    async findByToken(token: string): Promise<ResetPassword> {
        return await this.resetPasswordRepository.findOne({
            where: {
                token: token,
            },
            relations: {
                user: true,
            },
        });
    }

    async validateResetToken(token: string): Promise<boolean> {
        const resetPassword = await this.findByToken(token);

        if (!resetPassword) {
            return false;
        }

        if (resetPassword.expiresAt < new Date()) {
            return false;
        }

        return true;
    }

    async invalidateResetToken(token: string) {
        const resetPassword = await this.findByToken(token);
        await this.resetPasswordRepository.delete(resetPassword.id);
    }

}
