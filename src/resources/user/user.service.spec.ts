import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoggerService } from 'src/logger/logger.service';
import { invalidUUID } from 'test/data/UUIDs';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { registerUserDto } from 'test/data/register-user';
import { user, userJamesSmith, users } from 'test/data/users';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: any;
  let mockLoggerService: any;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue({}),
    };

    mockLoggerService = {
      error: jest.fn().mockResolvedValue({}),
      warn: jest.fn().mockResolvedValue({}),
      info: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {

    it('should return created user if all goes well', async () => {
      (mockUserRepository.create as jest.Mock).mockResolvedValue(user);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(user);
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await userService.create(registerUserDto);

      expect(result).toEqual(user);
    });

  });

  describe('findAll', () => {

    it('should return empty array if no users were found', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue({});

      const result = await userService.findAll();

      expect(result).toEqual([]);
    });

    it('should return User array if users were found', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue(users);

      const result = await userService.findAll();

      expect(result.length).toBe(users.length);
      expect(result).toEqual(users);
    });

  });

  describe('findOneById', () => {

    it('should return the user when the user exists', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await userService.findOneById(userJamesSmith.id);

      expect(result).toEqual(user);
    });

  });

  describe('findOneByEmail', () => {

    it('should return the user when the user exists', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await userService.findOneByEmail(userJamesSmith.email);

      expect(result).toEqual(user);
    });

  });
  
  describe('remove', () => {

    it('should return true if delete succeeds', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockUserRepository.delete as jest.Mock).mockResolvedValue(userJamesSmith);

      const result = await userService.remove(userJamesSmith.id);

      expect(result).toBe(true);
    });

  });

});
