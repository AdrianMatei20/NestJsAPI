import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordCleanupService } from './reset-password-cleanup.service';

describe('ResetPasswordCleanupService', () => {
  let service: ResetPasswordCleanupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResetPasswordCleanupService],
    }).compile();

    service = module.get<ResetPasswordCleanupService>(ResetPasswordCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
