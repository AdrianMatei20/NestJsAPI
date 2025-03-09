import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import { Log } from './entities/log.entity';
import { project, updateProjectDto } from 'test/data/projects';
import { userJamesSmith } from 'test/data/users';
import { getRepositoryToken } from '@nestjs/typeorm';
import { debugLog, errorLog, infoLog, logs, warnLog } from 'test/data/logs';

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let mockLogRepository: any;

  beforeEach(async () => {
    mockLogRepository = {
      save: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(() => ({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: getRepositoryToken(Log),
          useValue: mockLogRepository,
        },
      ],
    }).compile();

    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(loggerService).toBeDefined();
  });

  describe('error', () => {

    it('should call logRepository.save with correct parameters', async () => {
      const message = 'Failed to update project.';
      const context = 'ProjectService.update';
      const trace = 'Cannot read properties of undefined (reading \'find\')';
      const metadata = { projectId: project.id, project, updateProjectDto };

      (mockLogRepository.save as jest.Mock).mockResolvedValue(errorLog);

      await loggerService.error(message, context, trace, metadata);

      expect(mockLogRepository.save).toHaveBeenCalled();
      expect(mockLogRepository.save).toHaveBeenCalledWith({
        level: 'ERROR',
        message,
        context,
        metadata,
        trace,
        timestamp: expect.any(Date),
      });
    });

    it('should log to console if logRepository.save fails', async () => {
      const message = 'Failed to update project.';
      const context = 'ProjectService.update';
      const trace = 'Cannot read properties of undefined (reading \'find\')';
      const metadata = { projectId: project.id, project, updateProjectDto };

      (mockLogRepository.save as jest.Mock).mockRejectedValue(new Error('Database error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await loggerService.error(message, context, trace, metadata);

      expect(mockLogRepository.save).toHaveBeenCalled();
      expect(mockLogRepository.save).toHaveBeenCalledWith({
        level: 'ERROR',
        message,
        context,
        metadata,
        trace,
        timestamp: expect.any(Date),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save log: Database error',
      );

      consoleErrorSpy.mockRestore();
    });

  });

  describe('warn', () => {

    it('should call logRepository.save with correct parameters', async () => {
      const message = 'Could not update project. Project with not found.';
      const context = 'ProjectService.update';
      const metadata = { projectId: project.id, project, updateProjectDto };

      (mockLogRepository.save as jest.Mock).mockResolvedValue(warnLog);

      await loggerService.warn(message, context, metadata);

      expect(mockLogRepository.save).toHaveBeenCalled();
      expect(mockLogRepository.save).toHaveBeenCalledWith({
        level: 'WARN',
        message,
        context,
        metadata,
        timestamp: expect.any(Date),
      });
    });

    it('should log to console if logRepository.save fails', async () => {
      const message = 'Could not update project. Project with not found.';
      const context = 'ProjectService.update';
      const metadata = { projectId: project.id, project, updateProjectDto };

      (mockLogRepository.save as jest.Mock).mockRejectedValue(new Error('Database error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await loggerService.warn(message, context, metadata);

      expect(mockLogRepository.save).toHaveBeenCalled();
      expect(mockLogRepository.save).toHaveBeenCalledWith({
        level: 'WARN',
        message,
        context,
        metadata,
        timestamp: expect.any(Date),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save log: Database error',
      );

      consoleErrorSpy.mockRestore();
    });

  });

  describe('info', () => {

    it('should call logRepository.save with correct parameters', async () => {
      const message = 'Created project.';
      const context = 'ProjectService.create';
      const metadata = { project, userId: userJamesSmith.id };

      (mockLogRepository.save as jest.Mock).mockResolvedValue(infoLog);

      await loggerService.info(message, context, metadata);

      expect(mockLogRepository.save).toHaveBeenCalled();
      expect(mockLogRepository.save).toHaveBeenCalledWith({
        level: 'INFO',
        message,
        context,
        metadata,
        timestamp: expect.any(Date),
      });
    });

    it('should log to console if logRepository.save fails', async () => {
      const message = 'Created project.';
      const context = 'ProjectService.create';
      const metadata = { project, userId: userJamesSmith.id };

      (mockLogRepository.save as jest.Mock).mockRejectedValue(new Error('Database error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await loggerService.info(message, context, metadata);

      expect(mockLogRepository.save).toHaveBeenCalled();
      expect(mockLogRepository.save).toHaveBeenCalledWith({
        level: 'INFO',
        message,
        context,
        metadata,
        timestamp: expect.any(Date),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save log: Database error',
      );

      consoleErrorSpy.mockRestore();
    });

  });

  describe('debug', () => {

    it('should call logRepository.save with correct parameters', async () => {
      const message = 'Debug message.';
      const context = 'ProjectService.create';
      const metadata = { project, userId: userJamesSmith.id };

      (mockLogRepository.save as jest.Mock).mockResolvedValue(debugLog);

      await loggerService.debug(message, context, metadata);

      expect(mockLogRepository.save).toHaveBeenCalled();
      expect(mockLogRepository.save).toHaveBeenCalledWith({
        level: 'DEBUG',
        message,
        context,
        metadata,
        timestamp: expect.any(Date),
      });
    });

    it('should log to console if logRepository.save fails', async () => {
      const message = 'Debug message.';
      const context = 'ProjectService.create';
      const metadata = { project, userId: userJamesSmith.id };

      (mockLogRepository.save as jest.Mock).mockRejectedValue(new Error('Database error'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await loggerService.debug(message, context, metadata);

      expect(mockLogRepository.save).toHaveBeenCalled();
      expect(mockLogRepository.save).toHaveBeenCalledWith({
        level: 'DEBUG',
        message,
        context,
        metadata,
        timestamp: expect.any(Date),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save log: Database error',
      );

      consoleErrorSpy.mockRestore();
    });

  });

  describe('getLogs', () => {

    it('should return a list of all logs', async () => {
      (mockLogRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(logs),
      });

      const result = await loggerService.getLogs({order: 'DESC'});

      expect(result).toEqual(logs);
    });

    it('should return empty list if no logs are found', async () => {
      (mockLogRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await loggerService.getLogs({order: 'DESC'});

      expect(result).toEqual([]);
    });

    it('should return a list of filtered logs', async () => {
      (mockLogRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(logs),
      });

      const result = await loggerService.getLogs({
        level: 'error',
        fromDate: '2021-01-01 00:00:00.000',
        toDate: '2022-12-31 23:59:59.999',
        sortBy: 'timestamp',
        order: 'DESC'}
      );

      expect(result).toEqual(logs);
    });

    it('should log to console if logRepository.createQueryBuilder().getMany() fails', async () => {
      (mockLogRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error')),
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      await loggerService.getLogs({order: 'DESC'});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch logs: Database error',
      );

      consoleErrorSpy.mockRestore();
    });

  });

});
