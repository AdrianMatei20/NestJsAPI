import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordService } from './reset-password.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResetPassword } from './reset-password.entity';
import { UserService } from 'src/resources/user/user.service';
import { TokenService } from 'src/services/token/token.service';

describe('ResetPasswordService', () => {
  let resetPasswordService: ResetPasswordService;
  let mockProjectRepository: any;
  let mockUserService: any;
  let mockTokenService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordService,
        {
          provide: getRepositoryToken(ResetPassword),
          useValue: mockProjectRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    resetPasswordService = module.get<ResetPasswordService>(ResetPasswordService);
  });

  it('should be defined', () => {
    expect(resetPasswordService).toBeDefined();
  });
});
