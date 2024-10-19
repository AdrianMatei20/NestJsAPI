import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResetPassword } from '../reset-password/reset-password.entity';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ResetPasswordCleanupService {

    constructor(
        @InjectRepository(ResetPassword)
        private passwordResetRepository: Repository<ResetPassword>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCleanup() {
        const now = new Date();
        await this.passwordResetRepository.delete({
            expiresAt: LessThan(now),
        });
    }

}
