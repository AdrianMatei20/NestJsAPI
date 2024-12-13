import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/resources/user/user.service';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { EmailService } from 'src/services/email/email.service';
import { TokenService } from 'src/services/token/token.service';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let userServiceMock: any;
  let emailServiceMock: any;
  let resetPasswordServiceMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        ObjectValidationService,
        TokenService,
        JwtService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
        {
          provide: ResetPasswordService,
          useValue: resetPasswordServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
