import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordCleanupService } from './reset-password-cleanup.service';
import { ResetPassword } from '../reset-password/reset-password.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ResetPasswordCleanupService', () => {
  let resetPasswordCleanupService: ResetPasswordCleanupService;
  let mockProjectRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordCleanupService,
        {
          provide: getRepositoryToken(ResetPassword),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    resetPasswordCleanupService = module.get<ResetPasswordCleanupService>(ResetPasswordCleanupService);
  });

  it('should be defined', () => {
    expect(resetPasswordCleanupService).toBeDefined();
  });
});
