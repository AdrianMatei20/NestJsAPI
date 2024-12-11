import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../resources/user/user.service';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { EmailService } from 'src/services/email/email.service';
import { TokenService } from 'src/services/token/token.service';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let mockEmailService: any;

  beforeEach(async () => {

    // Mock UserService
    const mockUserService = {
      findByEmail: jest.fn(),
    };

    const mockEmailService = {
      sendRegistrationEmail: jest.fn().mockResolvedValue(true),
      sendResetPasswordEmail: jest.fn().mockResolvedValue(true),
    };

    const mockResetPasswordService = {
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ObjectValidationService,
        TokenService,
        JwtService,
        { provide: UserService, useValue: mockUserService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ResetPasswordService, useValue: mockResetPasswordService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
