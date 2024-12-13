import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordService } from './reset-password.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResetPassword } from './reset-password.entity';
import { UserService } from 'src/resources/user/user.service';
import { TokenService } from 'src/services/token/token.service';

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;
  let projectRepositoryMock: any;
  let userServiceMock: any;
  let tokenServiceMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordService,
        {
          provide: getRepositoryToken(ResetPassword),
          useValue: projectRepositoryMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: TokenService,
          useValue: tokenServiceMock,
        },
      ],
    }).compile();

    service = module.get<ResetPasswordService>(ResetPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
