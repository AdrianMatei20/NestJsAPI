import { Test, TestingModule } from '@nestjs/testing';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { Log } from './entities/log.entity';
import { logs } from 'test/data/logs';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { GlobalAdminGuard } from 'src/auth/guards/global-admin.guard';

describe('LoggerController', () => {
  let loggerController: LoggerController;
  let mockLoggerService: any;

  beforeEach(async () => {
    mockLoggerService = {
      getLogs: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoggerController],
      providers: [
        LoggerService,
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    loggerController = module.get<LoggerController>(LoggerController);
  });

  it('should be defined', () => {
    expect(loggerController).toBeDefined();
  });

  describe('GET (getLogs)', () => {

    it('should have AuthenticatedGuard and GlobalAdminGuard', async () => {
          const guards = Reflect.getMetadata('__guards__', loggerController.findAll);
          expect(guards).toBeDefined();
          expect(guards.length).toBe(2);
          expect(guards[0]).toBe(GlobalAdminGuard);
          expect(guards[1]).toBe(AuthenticatedGuard);
    });

    it('should call loggerService.getLogs', async () => {
      const expectedResult: Log[] = logs;

      (mockLoggerService.getLogs as jest.Mock).mockResolvedValue(expectedResult);

      const actualResult: Log[] = await loggerController.findAll();

      expect(actualResult).toEqual(expectedResult);
      expect(mockLoggerService.getLogs).toHaveBeenCalled();
    });

  });

});
