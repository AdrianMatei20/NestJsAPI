import { Module } from '@nestjs/common';
import { UserModule } from 'src/resources/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './serialization.provider';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { EmailService } from 'src/services/email/email.service';
import { TokenService } from 'src/services/token/token.service';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetPassword } from './reset-password/reset-password.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([ResetPassword])],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer, ObjectValidationService, EmailService, TokenService, JwtService, ResetPasswordService],
})
export class AuthModule {}
