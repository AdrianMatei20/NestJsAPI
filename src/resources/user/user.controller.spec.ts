import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, HttpStatus, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LoggerService } from 'src/logger/logger.service';

import { User } from './entities/user.entity';
import { GlobalRole } from './enums/global-role';
import { AdminUserDto } from './dto/admin-user.dto';
import { PublicUserDto } from './dto/public-user.dto';

import { user, userJamesSmith, users } from 'test/data/users';
import { invalidUUID, nonExistingUserId } from 'test/data/UUIDs';

import { RETURN_MESSAGES } from 'src/constants/return-messages';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: any;
  let mockLoggerService: any;

  beforeEach(async () => {
    mockUserService = {
      findAll: jest.fn().mockResolvedValue([]),
      findOneById: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('/user (GET)', () => {

    it('should return AdminUserDto for admin requests', async () => {
      const mockUsers: User[] = users;
      (mockUserService.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const mockReq = { user: { globalRole: GlobalRole.ADMIN } };

      const result = await userController.findAll(mockReq);

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: `${users.length} users found`,
        data: mockUsers.map(user => new AdminUserDto(user)),
      });
    });

    it('should return AdminUserDto array with one user for admin requests', async () => {
      (mockUserService.findAll as jest.Mock).mockResolvedValue([user]);

      const mockReq = { user: { globalRole: GlobalRole.ADMIN } };

      const result = await userController.findAll(mockReq);

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: '1 user found',
        data: [new AdminUserDto(user)],
      });
    });

    it('should return PublicUserDto array for regular user requests', async () => {
      const mockUsers: User[] = users;
      (mockUserService.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const mockReq = { user: { globalRole: GlobalRole.REGULAR_USER } };

      const result = await userController.findAll(mockReq);

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: `${users.length} users found`,
        data: mockUsers.map(user => new PublicUserDto(user)),
      });
    });

    it('should return PublicUserDto array with one user for regular user requests', async () => {
      (mockUserService.findAll as jest.Mock).mockResolvedValue([user]);

      const mockReq = { user: { globalRole: GlobalRole.REGULAR_USER } };

      const result = await userController.findAll(mockReq);

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: '1 user found',
        data: [new PublicUserDto(user)],
      });
    });

    it('should return 403 Forbidden for unknown role requests', async () => {
      const mockUsers: User[] = users;
      (mockUserService.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const mockReq = { user: { globalRole: 'UNKNOWN_ROLE' } };

      await expect(userController.findAll(mockReq))
        .rejects.toThrow(ForbiddenException);

      try {
        await userController.findAll(mockReq);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }
    });
    
  });

  describe('/user/:id (GET)', () => {

    it('should return 400 BadRequest for invalid user id', async () => {
      const mockReq = { user: { globalRole: GlobalRole.REGULAR_USER } };

      await expect(userController.findOne(mockReq, invalidUUID))
        .rejects.toThrow(BadRequestException);

      try {
        await userController.findOne(mockReq, invalidUUID);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.INVALID_USER_ID,
        });
      }
    });

    it('should return 404 NotFound if user is not found', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(null);

      const mockReq = { user: { globalRole: GlobalRole.REGULAR_USER } };

      await expect(userController.findOne(mockReq, userJamesSmith.id))
        .rejects.toThrow(NotFoundException);
      expect(mockUserService.findOneById).toHaveBeenCalled();
      expect(mockUserService.findOneById).toHaveBeenCalledWith(userJamesSmith.id);

      try {
        await userController.findOne(mockReq, userJamesSmith.id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.NOT_FOUND,
          message: RETURN_MESSAGES.NOT_FOUND.USER,
        });
      }
    });

    it('should return AdminUserDto when user is ADMIN', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(user);

      const mockReq = { user: { globalRole: GlobalRole.ADMIN } };

      const result = await userController.findOne(mockReq, userJamesSmith.id);

      expect(mockUserService.findOneById).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.USER_FOUND,
        data: new AdminUserDto(user),
      });
    });

    it('should return PublicUserDto when user is REGULAR_USER', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(user);

      const mockReq = { user: { globalRole: GlobalRole.REGULAR_USER } };

      const result = await userController.findOne(mockReq, userJamesSmith.id);

      expect(mockUserService.findOneById).toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.USER_FOUND,
        data: new PublicUserDto(user),
      });
    });

    it('should return 403 Forbidden if user has other role', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(user);

      const mockReq = { user: { globalRole: 'UNKNOWN_ROLE' } };

      await expect(userController.findOne(mockReq, userJamesSmith.id))
        .rejects.toThrow(ForbiddenException);

      try {
        await userController.findOne(mockReq, userJamesSmith.id);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }
    });

  });

  describe('/user/:id (DELETE)', () => {

    it('should return 400 BadRequest for invalid user id', async () => {
      await expect(userController.remove(invalidUUID))
        .rejects.toThrow(BadRequestException);

      try {
        await userController.remove(invalidUUID);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.INVALID_USER_ID,
        });
      }
    });

    it('should return 404 NotFound when user does not exist', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(null);
      (mockUserService.remove as jest.Mock).mockResolvedValue(false);

      await expect(userController.remove(nonExistingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should return 500 InternalServerError when UserService.remove fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(user);
      (mockUserService.remove as jest.Mock).mockResolvedValue(false);

      await expect(userController.remove(userJamesSmith.id))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockUserService.findOneById).toHaveBeenCalled();
      expect(mockUserService.findOneById).toHaveBeenCalledWith(userJamesSmith.id);

      try {
        await userController.remove(userJamesSmith.id);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should return 200 OK when user is deleted', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(user);
      (mockUserService.remove as jest.Mock).mockResolvedValue(true);

      const result = await userController.remove(userJamesSmith.id);

      expect(mockUserService.remove).toHaveBeenCalledWith(userJamesSmith.id);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.USER_DELETED,
      });
    });

  });

});
