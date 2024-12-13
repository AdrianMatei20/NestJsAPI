import { Test, TestingModule } from '@nestjs/testing';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';

describe('LoggerController', () => {
  let controller: LoggerController;
  let logRepositoryMock: any;

  beforeEach(async () => {
    logRepositoryMock = {
      save: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoggerController],
      providers: [
        LoggerService,
        {
          provide: LoggerService,
          useValue: logRepositoryMock,
        },
      ],
    }).compile();

    controller = module.get<LoggerController>(LoggerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
