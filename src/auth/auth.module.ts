import { Module } from '@nestjs/common';
import { UserModule } from 'src/resources/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './serialization.provider';
import { ObjectValidationService } from 'src/services/object-validation.service';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer, ObjectValidationService],
})
export class AuthModule {}
