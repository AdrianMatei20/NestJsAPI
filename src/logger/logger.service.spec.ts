import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let logRepositoryMock: any;

  beforeEach(async () => {
    logRepositoryMock = {
      save: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: LoggerService,
          useValue: logRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
