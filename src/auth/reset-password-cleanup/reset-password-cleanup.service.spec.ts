import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordCleanupService } from './reset-password-cleanup.service';
import { ResetPassword } from '../reset-password/reset-password.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ResetPasswordCleanupService', () => {
  let service: ResetPasswordCleanupService;
  let projectRepositoryMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordCleanupService,
        {
          provide: getRepositoryToken(ResetPassword),
          useValue: projectRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ResetPasswordCleanupService>(ResetPasswordCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
