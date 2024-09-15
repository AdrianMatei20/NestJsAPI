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

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer, ObjectValidationService, EmailService, TokenService, JwtService],
})
export class AuthModule {}
