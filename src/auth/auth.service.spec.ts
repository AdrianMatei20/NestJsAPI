import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../resources/user/user.service';
import { ObjectValidationService } from 'src/services/object-validation/object-validation.service';
import { EmailService } from 'src/services/email/email.service';
import { TokenService } from 'src/services/token/token.service';
import { LoggerService } from 'src/logger/logger.service';
import { BadRequestException, ConflictException, HttpStatus, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { getRegisterUserDto as getResetPasswordDto, emptyRegisterUserDto, registerUserDtoNoEmail, registerUserDtoNoFirstname, registerUserDtoNoLastname, registerUserDtoNoPassword, registerUserDtoNoPasswordConfirmation, registerUserDtoPasswordsNotMatching, getRegisterUserDto, getSanitizedRegisterUserDto } from 'test/data/register-user';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { badResetPasswordDto, forgotPasswordDto, logInUserDto, resetPassword, user, userJamesSmith } from 'test/data/users';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { invalidUUID, nonExistingUserId } from 'test/data/UUIDs';

import * as bcrypt from 'bcrypt';
import { LOG_MESSAGES } from 'src/constants/log-messages';
import { LOG_CONTEXTS } from 'src/constants/log-contexts';
import { RETURN_MESSAGES } from 'src/constants/return-messages';

// Mock bcrypt methods
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: any;
  let mockEmailService: any;
  let mockTokenService: any;
  let mockResetPasswordService: any;
  let mockLoggerService: any;

  beforeEach(async () => {
    mockUserService = {
      findOneByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(userJamesSmith),
      findOneById: jest.fn().mockResolvedValue(userJamesSmith),
      markUserAccountAsVerified: jest.fn().mockResolvedValue(userJamesSmith),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
    };

    mockEmailService = {
      sendRegistrationEmail: jest.fn().mockResolvedValue(true),
      sendResetPasswordEmail: jest.fn().mockResolvedValue(true),
    };

    mockTokenService = {
      createToken: jest.fn().mockResolvedValue('token'),
      verifyToken: jest.fn().mockResolvedValue({}),
    };

    mockResetPasswordService = {
      createResetToken: jest.fn().mockResolvedValue({}),
      validateResetToken: jest.fn().mockResolvedValue({}),
      findByToken: jest.fn().mockResolvedValue({}),
      invalidateResetToken: jest.fn().mockResolvedValue({}),
    };

    mockLoggerService = {
      error: jest.fn().mockResolvedValue({}),
      warn: jest.fn().mockResolvedValue({}),
      info: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ObjectValidationService,
        { provide: UserService, useValue: mockUserService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: ResetPasswordService, useValue: mockResetPasswordService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clears mock calls, instances, and results
    jest.resetModules(); // Clears module imports (if needed)
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {

    it('should return null if UserService.findOneByEmail fails', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await authService.validateUser(logInUserDto);
      expect(result).toBe(null);
    });

    it('should return null if user is not found', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser(logInUserDto);
      expect(result).toBe(null);
    });

    it('should return null if password doesn\'t match', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser(logInUserDto);
      expect(result).toBe(null);
    });

    it('should return the user if all is well', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(logInUserDto);
      expect(result).toBe(user);
    });

  });

  describe('registerUser', () => {

    it('should throw BadRequestException for missing parameters', async () => {
      await expect(authService.registerUser(emptyRegisterUserDto as RegisterUserDto))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.MISSING_PROPS(['firstname', 'lastname', 'email', 'password', 'passwordConfirmation']),
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: emptyRegisterUserDto },
      );

      try {
        await authService.registerUser(emptyRegisterUserDto as RegisterUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.MISSING_PROPS(['firstname', 'lastname', 'email', 'password', 'passwordConfirmation']),
        });
      }
    });

    it('should throw BadRequestException for missing firstname', async () => {
      await expect(authService.registerUser(registerUserDtoNoFirstname as RegisterUserDto))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.MISSING_PROPS(['firstname']),
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDtoNoFirstname as RegisterUserDto) },
      );

      try {
        await authService.registerUser(registerUserDtoNoFirstname as RegisterUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.MISSING_PROPS(['firstname']),
        });
      }
    });

    it('should throw BadRequestException for missing lastname', async () => {
      await expect(authService.registerUser(registerUserDtoNoLastname as RegisterUserDto))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.MISSING_PROPS(['lastname']),
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDtoNoLastname as RegisterUserDto) },
      );

      try {
        await authService.registerUser(registerUserDtoNoLastname as RegisterUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.MISSING_PROPS(['lastname']),
        });
      }
    });

    it('should throw BadRequestException for missing email', async () => {
      await expect(authService.registerUser(registerUserDtoNoEmail as RegisterUserDto))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.MISSING_PROPS(['email']),
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDtoNoEmail as RegisterUserDto) },
      );

      try {
        await authService.registerUser(registerUserDtoNoEmail as RegisterUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.MISSING_PROPS(['email']),
        });
      }
    });

    it('should throw BadRequestException for missing password', async () => {
      await expect(authService.registerUser(registerUserDtoNoPassword as RegisterUserDto))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.MISSING_PROPS(['password']),
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDtoNoPassword as RegisterUserDto) },
      );

      try {
        await authService.registerUser(registerUserDtoNoPassword as RegisterUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.MISSING_PROPS(['password']),
        });
      }
    });

    it('should throw BadRequestException for missing password confirmation', async () => {
      await expect(authService.registerUser(registerUserDtoNoPasswordConfirmation as RegisterUserDto))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.MISSING_PROPS(['passwordConfirmation']),
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDtoNoPasswordConfirmation as RegisterUserDto) },
      );

      try {
        await authService.registerUser(registerUserDtoNoPasswordConfirmation as RegisterUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.MISSING_PROPS(['passwordConfirmation']),
        });
      }
    });

    it('should throw ConflictException for email already registered', async () => {
      const registerUserDto: RegisterUserDto = getRegisterUserDto();
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(userJamesSmith);

      await expect(authService.registerUser(registerUserDto))
        .rejects.toThrow(ConflictException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.EMAIL_ALREADY_REGISTERED,
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDto as RegisterUserDto) },
      );

      try {
        await authService.registerUser(registerUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.CONFLICT,
          message: RETURN_MESSAGES.CONFLICT.EMAIL_ALREADY_REGISTERED,
        });
      }
    });

    it('should throw BadRequestException if passwords don\'t match', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.registerUser(registerUserDtoPasswordsNotMatching as RegisterUserDto))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.PASSWORD_MISMATCH,
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDtoPasswordsNotMatching as RegisterUserDto) },
      );

      try {
        await authService.registerUser(registerUserDtoPasswordsNotMatching);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.PASSWORD_MISMATCH,
        });
      }
    });

    it('should throw InternalServerErrorException if userService.create fails', async () => {
      const registerUserDto: RegisterUserDto = getRegisterUserDto();
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (mockUserService.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.registerUser(registerUserDto))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.FAILED_TO_REGISTER_USER(registerUserDto.email, 'Database error'),
        LOG_CONTEXTS.AuthService.registerUser,
        'Database error',
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDto as RegisterUserDto) },
      );

      try {
        await authService.registerUser(getRegisterUserDto());
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw ServiceUnavailableException if emailService.sendRegistrationEmail fails', async () => {
      const registerUserDto: RegisterUserDto = getRegisterUserDto();
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (mockUserService.create as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockTokenService.createToken as jest.Mock).mockReturnValue('token');
      (mockEmailService.sendRegistrationEmail as jest.Mock).mockRejectedValue(new Error('Email error'));

      await expect(authService.registerUser(registerUserDto))
        .rejects.toThrow(ServiceUnavailableException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.FAILED_TO_SEND_EMAIL(registerUserDto.email, 'Email error'),
        LOG_CONTEXTS.AuthService.registerUser,
        'Email error',
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDto as RegisterUserDto) },
      );

      try {
        await authService.registerUser(getRegisterUserDto());
      } catch (error) {
        expect(error).toBeInstanceOf(ServiceUnavailableException);
        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: RETURN_MESSAGES.SERVICE_UNAVAILABLE,
        });
      }
    });

    it('should call emailService.sendRegistrationEmail with correct parameters', async () => {
      const registerUserDto: RegisterUserDto = getRegisterUserDto();
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (mockUserService.create as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockTokenService.createToken as jest.Mock).mockReturnValue('token');
      (mockEmailService.sendRegistrationEmail as jest.Mock).mockResolvedValue(true);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.REGISTRATION_EMAIL_SENT,
      };

      const actualResult = await authService.registerUser(registerUserDto);

      expect(mockEmailService.sendRegistrationEmail).toHaveBeenCalled();
      expect(mockEmailService.sendRegistrationEmail).toHaveBeenCalledWith(
        userJamesSmith.email,
        `${userJamesSmith.firstname} ${userJamesSmith.lastname}`,
        `http://localhost:3001/auth/verify-user/${userJamesSmith.id}/token`,
      );
      expect(mockLoggerService.info).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledTimes(2);
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.CONFIRMATION_EMAIL(user.email),
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDto as RegisterUserDto), user: userJamesSmith, },
      );
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.REGISTER_USER.SUCCESS(userJamesSmith.firstname, userJamesSmith.lastname, userJamesSmith.email),
        LOG_CONTEXTS.AuthService.registerUser,
        { registerUserDto: getSanitizedRegisterUserDto(registerUserDto as RegisterUserDto), user: userJamesSmith, },
      );
      expect(actualResult).toEqual(expectedResult);
    });

  });

  describe('verifyUser', () => {

    it('should throw BadRequestException for invalid user id', async () => {
      await expect(authService.verifyUser(invalidUUID, 'token'))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.VERIFY_USER.INVALID_UUID,
        LOG_CONTEXTS.AuthService.verifyUser,
        { userId: invalidUUID },
      );

      try {
        await authService.verifyUser(invalidUUID, 'token');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.INVALID_USER_ID,
        });
      }
    });

    it('should throw InternalServerErrorException if userService.findOneById fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.verifyUser(userJamesSmith.id, 'token'))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.VERIFY_USER.FAILED_TO_FIND_USER(userJamesSmith.id),
        LOG_CONTEXTS.AuthService.verifyUser,
        'Database error',
        { userId: userJamesSmith.id },
      );

      try {
        await authService.verifyUser(userJamesSmith.id, 'token');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw NotFoundException if user is not found', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(null);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.SUCCESSFUL_VERIFICATION,
      }

      const actualResult: SimpleMessageDto = await authService.verifyUser(nonExistingUserId, 'token');

      expect(actualResult).toEqual(expectedResult);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.VERIFY_USER.USER_NOT_FOUND(nonExistingUserId),
        LOG_CONTEXTS.AuthService.verifyUser,
        { userId: nonExistingUserId },
      );
    });

    it('should throw ForbiddenException if token is expired or invalid', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      mockTokenService.verifyToken.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verifyUser(userJamesSmith.id, 'token'))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.VERIFY_USER.BAD_TOKEN('token'),
        LOG_CONTEXTS.AuthService.verifyUser,
        { userId: userJamesSmith.id, token: 'token' },
      );

      try {
        await authService.verifyUser(userJamesSmith.id, 'token');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.BAD_TOKEN,
        });
      }
    });

    it('should throw InternalServerErrorException if userService.markUserAccountAsVerified fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      mockTokenService.verifyToken.mockImplementationOnce(() => {
        return true;
      });
      (mockUserService.markUserAccountAsVerified as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.verifyUser(userJamesSmith.id, 'token'))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.VERIFY_USER.FAILED_TO_VERIFY_USER,
        LOG_CONTEXTS.AuthService.verifyUser,
        'Database error',
        { userId: userJamesSmith.id, token: 'token' },
      );

      try {
        await authService.verifyUser(userJamesSmith.id, 'token');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should return 200 and a confirmation message if all goes well', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      mockTokenService.verifyToken.mockImplementationOnce(() => {
        return true;
      });
      (mockUserService.markUserAccountAsVerified as jest.Mock).mockResolvedValue(userJamesSmith);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.SUCCESSFUL_VERIFICATION,
      }

      const actualResult: SimpleMessageDto = await authService.verifyUser(userJamesSmith.id, 'token');

      expect(actualResult).toEqual(expectedResult);
      expect(mockLoggerService.info).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.VERIFY_USER.SUCCESS(userJamesSmith.firstname, userJamesSmith.lastname, userJamesSmith.email),
        LOG_CONTEXTS.AuthService.verifyUser,
        { userId: userJamesSmith.id, token: 'token' },
      );
    });

  });

  describe('sendResetPasswordEmail', () => {

    it('should throw BadRequestException for invalid user id', async () => {
      await expect(authService.sendResetPasswordEmail(invalidUUID))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_RESET_PASSWORD_EMAIL.INVALID_UUID,
        LOG_CONTEXTS.AuthService.sendResetPasswordEmail,
        { userId: invalidUUID },
      );

      try {
        await authService.sendResetPasswordEmail(invalidUUID);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.INVALID_USER_ID,
        });
      }
    });

    it('should throw InternalServerErrorException if userService.findOneById fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.sendResetPasswordEmail(userJamesSmith.id))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_RESET_PASSWORD_EMAIL.FAILED_TO_FIND_USER(userJamesSmith.id),
        LOG_CONTEXTS.AuthService.sendResetPasswordEmail,
        'Database error',
        { userId: userJamesSmith.id },
      );

      try {
        await authService.sendResetPasswordEmail(userJamesSmith.id);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should return a confirmation message if user is not found', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(null);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.RESET_PASSWORD_EMAIL_SENT,
      };

      const actualResult = await authService.sendResetPasswordEmail(userJamesSmith.id);

      expect(actualResult).toEqual(expectedResult);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_RESET_PASSWORD_EMAIL.USER_NOT_FOUND(userJamesSmith.id),
        LOG_CONTEXTS.AuthService.sendResetPasswordEmail,
        { userId: userJamesSmith.id },
      );
    });

    it('should throw InternalServerErrorException if TokenService.createResetToken fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.createResetToken as jest.Mock).mockRejectedValue(new Error('error'));

      await expect(authService.sendResetPasswordEmail(userJamesSmith.id))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_RESET_PASSWORD_EMAIL.FAILED_TO_SEND_RESET_PASSWORD_EMAIL(userJamesSmith.email, 'error'),
        LOG_CONTEXTS.AuthService.sendResetPasswordEmail,
        'error',
        { user: userJamesSmith },
      );

      try {
        await authService.sendResetPasswordEmail(userJamesSmith.id);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw ServiceUnavailableException if EmailService.sendResetPasswordEmail fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.createResetToken as jest.Mock).mockResolvedValue('token');
      (mockEmailService.sendResetPasswordEmail as jest.Mock).mockRejectedValue(new Error('error'));

      await expect(authService.sendResetPasswordEmail(userJamesSmith.id))
        .rejects.toThrow(ServiceUnavailableException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_RESET_PASSWORD_EMAIL.FAILED_TO_SEND_RESET_PASSWORD_EMAIL(userJamesSmith.email, 'error'),
        LOG_CONTEXTS.AuthService.sendResetPasswordEmail,
        'error',
        { user: userJamesSmith },
      );

      try {
        await authService.sendResetPasswordEmail(userJamesSmith.id);
      } catch (error) {
        expect(error).toBeInstanceOf(ServiceUnavailableException);
        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: RETURN_MESSAGES.SERVICE_UNAVAILABLE,
        });
      }
    });

    it('should call EmailService.sendResetPasswordEmail with correct parameters if all goes well', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.createResetToken as jest.Mock).mockResolvedValue('token');
      (mockEmailService.sendResetPasswordEmail as jest.Mock).mockResolvedValue(true);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.RESET_PASSWORD_EMAIL_SENT,
      };

      const actualResult = await authService.sendResetPasswordEmail(userJamesSmith.id);

      expect(actualResult).toEqual(expectedResult);
      expect(mockLoggerService.info).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_RESET_PASSWORD_EMAIL.SUCCESS(userJamesSmith.email),
        LOG_CONTEXTS.AuthService.sendResetPasswordEmail,
        { user: userJamesSmith },
      );
      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalled();
      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        userJamesSmith.email,
        userJamesSmith.firstname + " " + userJamesSmith.lastname,
        "http://localhost:3001/auth/reset-password/" + userJamesSmith.id + "/" + 'token',
      );
    });

  });

  describe('sendForgotPasswordEmail', () => {

    it('should throw InternalServerErrorException if userService.findOneByEmail fails', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.sendForgotPasswordEmail(forgotPasswordDto))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_FORGOT_PASSWORD_EMAIL.FAILED_TO_FIND_USER(forgotPasswordDto.email),
        LOG_CONTEXTS.AuthService.sendForgotPasswordEmail,
        'Database error',
        { forgotPasswordDto: forgotPasswordDto },
      );

      try {
        await authService.sendForgotPasswordEmail(forgotPasswordDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should return a confirmation message if user is not found', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.FORGOT_PASSWORD_EMAIL_SENT,
      };

      const actualResult = await authService.sendForgotPasswordEmail(forgotPasswordDto);

      expect(actualResult).toEqual(expectedResult);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_FORGOT_PASSWORD_EMAIL.USER_NOT_FOUND(forgotPasswordDto.email),
        LOG_CONTEXTS.AuthService.sendForgotPasswordEmail,
        { forgotPasswordDto: forgotPasswordDto },
      );
    });

    it('should throw InternalServerErrorException if TokenService.createResetToken fails', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.createResetToken as jest.Mock).mockRejectedValue(new Error('error'));

      await expect(authService.sendForgotPasswordEmail(forgotPasswordDto))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_FORGOT_PASSWORD_EMAIL.FAILED_TO_SEND_RESET_PASSWORD_EMAIL(forgotPasswordDto.email, 'error'),
        LOG_CONTEXTS.AuthService.sendForgotPasswordEmail,
        'error',
        { forgotPasswordDto: forgotPasswordDto, user: userJamesSmith },
      );

      try {
        await authService.sendForgotPasswordEmail(forgotPasswordDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw ServiceUnavailableException if EmailService.sendResetPasswordEmail fails', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.createResetToken as jest.Mock).mockResolvedValue('token');
      (mockEmailService.sendResetPasswordEmail as jest.Mock).mockRejectedValue(new Error('error'));

      await expect(authService.sendForgotPasswordEmail(forgotPasswordDto))
        .rejects.toThrow(ServiceUnavailableException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_FORGOT_PASSWORD_EMAIL.FAILED_TO_SEND_RESET_PASSWORD_EMAIL(forgotPasswordDto.email, 'error'),
        LOG_CONTEXTS.AuthService.sendForgotPasswordEmail,
        'error',
        { forgotPasswordDto: forgotPasswordDto, user: userJamesSmith },
      );

      try {
        await authService.sendForgotPasswordEmail(forgotPasswordDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ServiceUnavailableException);
        expect(error.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: RETURN_MESSAGES.SERVICE_UNAVAILABLE,
        });
      }
    });

    it('should call EmailService.sendResetPasswordEmail with correct parameters if all goes well', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.createResetToken as jest.Mock).mockResolvedValue('token');
      (mockEmailService.sendResetPasswordEmail as jest.Mock).mockResolvedValue(true);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.FORGOT_PASSWORD_EMAIL_SENT,
      };

      const actualResult = await authService.sendForgotPasswordEmail(forgotPasswordDto);

      expect(actualResult).toEqual(expectedResult);
      expect(mockLoggerService.info).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.SEND_FORGOT_PASSWORD_EMAIL.SUCCESS(userJamesSmith.email),
        LOG_CONTEXTS.AuthService.sendForgotPasswordEmail,
        { forgotPasswordDto: forgotPasswordDto, user: userJamesSmith },
      );
      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalled();
      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        userJamesSmith.email,
        userJamesSmith.firstname + " " + userJamesSmith.lastname,
        "http://localhost:3001/auth/reset-password/" + userJamesSmith.id + "/" + 'token',
      );
    });

  });

  describe('resetPassword', () => {

    it('should throw BadRequestException for invalid user id', async () => {
      await expect(authService.resetPassword(invalidUUID, 'token', getResetPasswordDto()))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.INVALID_UUID,
        LOG_CONTEXTS.AuthService.resetPassword,
        { userId: invalidUUID, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );

      try {
        await authService.resetPassword(invalidUUID, 'token', getResetPasswordDto());
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.INVALID_USER_ID,
        });
      }
    });

    it('should throw InternalServerErrorException if UserService.findOneById fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto()))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.FAILED_TO_FIND_USER(userJamesSmith.id),
        LOG_CONTEXTS.AuthService.resetPassword,
        'Database error',
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );

      try {
        await authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto());
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should return a confirmation message if user is not found', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(null);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.PASSWORD_RESET,
      };

      const actualResult = await authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto());

      expect(actualResult).toEqual(expectedResult);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.USER_NOT_FOUND(userJamesSmith.id),
        LOG_CONTEXTS.AuthService.resetPassword,
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );
    });

    it('should throw InternalServerErrorException if ResetPasswordService.validateResetToken fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.validateResetToken as jest.Mock).mockRejectedValue(new Error('error'));

      await expect(authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto()))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.FAILED_TO_VALIDATE_TOKEN('token'),
        LOG_CONTEXTS.AuthService.resetPassword,
        'error',
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );

      try {
        await authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto());
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw BadRequestException for invalid or expired tokens', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.validateResetToken as jest.Mock).mockResolvedValue(false);

      await expect(authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto()))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.BAD_TOKEN,
        LOG_CONTEXTS.AuthService.resetPassword,
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );

      try {
        await authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto());
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.BAD_TOKEN,
        });
      }
    });

    it('should throw BadRequestException for non-matching passwords', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.validateResetToken as jest.Mock).mockResolvedValue(true);

      await expect(authService.resetPassword(userJamesSmith.id, 'token', badResetPasswordDto))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.PASSWORD_MISMATCH,
        LOG_CONTEXTS.AuthService.resetPassword,
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: badResetPasswordDto },
      );

      try {
        await authService.resetPassword(userJamesSmith.id, 'token', badResetPasswordDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.PASSWORD_MISMATCH,
        });
      }
    });

    it('should throw InternalServerErrorException if ResetPasswordService.findByToken fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.validateResetToken as jest.Mock).mockResolvedValue(true);
      (mockResetPasswordService.findByToken as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto()))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.FAILED,
        LOG_CONTEXTS.AuthService.resetPassword,
        'Database error',
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );

      try {
        await authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto());
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw InternalServerErrorException if UserService.update fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.validateResetToken as jest.Mock).mockResolvedValue(true);
      (mockResetPasswordService.findByToken as jest.Mock).mockResolvedValue(resetPassword);
      (mockUserService.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto()))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.FAILED,
        LOG_CONTEXTS.AuthService.resetPassword,
        'Database error',
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );

      try {
        await authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto());
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw InternalServerErrorException if ResetPasswordService.invalidateResetToken fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.validateResetToken as jest.Mock).mockResolvedValue(true);
      (mockResetPasswordService.findByToken as jest.Mock).mockResolvedValue(resetPassword);
      (mockUserService.update as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.invalidateResetToken as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto()))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.FAILED,
        LOG_CONTEXTS.AuthService.resetPassword,
        'Database error',
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );

      try {
        await authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto());
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should reset user\'s password if all goes well', async () => {
      const oldPassword: string = user.password;

      (mockUserService.findOneById as jest.Mock).mockResolvedValue(user);
      (mockResetPasswordService.validateResetToken as jest.Mock).mockResolvedValue(true);
      (mockResetPasswordService.findByToken as jest.Mock).mockResolvedValue(resetPassword);
      (mockUserService.update as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockResetPasswordService.invalidateResetToken as jest.Mock).mockResolvedValue({});

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.PASSWORD_RESET,
      };

      const actualResult: SimpleMessageDto = await authService.resetPassword(userJamesSmith.id, 'token', getResetPasswordDto());

      expect(actualResult).toEqual(expectedResult);
      expect(oldPassword).not.toBe(user.password);
      expect(mockLoggerService.info).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.RESET_PASSWORD.SUCCESS,
        LOG_CONTEXTS.AuthService.resetPassword,
        { userId: userJamesSmith.id, token: 'token', resetPasswordDto: getResetPasswordDto() },
      );
    });

  });

  describe('findById', () => {

    it('should return null if user is not found', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(null);

      const result = await authService.findById(userJamesSmith.id);

      expect(result).toBe(null);
    });

    it('should return the actual user', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);

      const result = await authService.findById(userJamesSmith.id);

      expect(result).toEqual(userJamesSmith);
    });

  });

  describe('findByEmail', () => {

    it('should throw InternalServerErrorException if UserService.findOneByEmail fails', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.findByEmail(userJamesSmith.email))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.FIND_BY_EMAIL.FAILED_TO_FIND_USER(userJamesSmith.email),
        LOG_CONTEXTS.AuthService.findByEmail,
        'Database error',
        { email: userJamesSmith.email },
      );

      try {
        await authService.findByEmail(userJamesSmith.email);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw NotFoundException if user is not found', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.findByEmail(userJamesSmith.email))
        .rejects.toThrow(NotFoundException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.FIND_BY_EMAIL.USER_NOT_FOUND(userJamesSmith.email),
        LOG_CONTEXTS.AuthService.findByEmail,
        { email: userJamesSmith.email },
      );

      try {
        await authService.findByEmail(userJamesSmith.email);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.NOT_FOUND,
          message: RETURN_MESSAGES.NOT_FOUND.USER,
        });
      }
    });

    it('should return the actual user', async () => {
      (mockUserService.findOneByEmail as jest.Mock).mockResolvedValue(userJamesSmith);

      const result = await authService.findByEmail(userJamesSmith.id);

      expect(result).toEqual(userJamesSmith);
    });

  });

  describe('deleteUser', () => {

    it('should throw BadRequestException for invalid user id', async () => {
      await expect(authService.deleteUser(invalidUUID))
        .rejects.toThrow(BadRequestException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.DELETE_USER.INVALID_UUID,
        LOG_CONTEXTS.AuthService.deleteUser,
        { userId: invalidUUID },
      );

      try {
        await authService.deleteUser(invalidUUID);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.BAD_REQUEST,
          message: RETURN_MESSAGES.BAD_REQUEST.INVALID_USER_ID,
        });
      }
    });

    it('should throw InternalServerErrorException if userService.findOneById fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.deleteUser(userJamesSmith.id))
        .rejects.toThrow(InternalServerErrorException);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.DELETE_USER.FAILED_TO_FIND_USER(userJamesSmith.id),
        LOG_CONTEXTS.AuthService.deleteUser,
        'Database error',
        { userId: userJamesSmith.id },
      );

      try {
        await authService.deleteUser(userJamesSmith.id);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should throw NotFoundException if user is not found', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(null);

      await expect(authService.deleteUser(nonExistingUserId))
        .rejects.toThrow(NotFoundException);
      expect(mockLoggerService.warn).toHaveBeenCalled();
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.DELETE_USER.USER_NOT_FOUND(nonExistingUserId),
        LOG_CONTEXTS.AuthService.deleteUser,
        { userId: nonExistingUserId },
      );

      try {
        await authService.deleteUser(nonExistingUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.NOT_FOUND,
          message: RETURN_MESSAGES.NOT_FOUND.USER,
        });
      }
    });

    it('should throw InternalServerErrorException if userService.remove fails', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockUserService.remove as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.deleteUser(userJamesSmith.id))
        .rejects.toThrow(InternalServerErrorException);

      expect(mockUserService.remove).toHaveBeenCalled();
      expect(mockUserService.remove).toHaveBeenCalledWith(userJamesSmith.id);
      expect(mockLoggerService.error).toHaveBeenCalled();
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.DELETE_USER.FAILED_TO_DELETE_USER,
        LOG_CONTEXTS.AuthService.deleteUser,
        'Database error',
        { userId: userJamesSmith.id, user: userJamesSmith },
      );

      try {
        await authService.deleteUser(userJamesSmith.id);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: RETURN_MESSAGES.INTERNAL_SERVER_ERROR,
        });
      }
    });

    it('should call UserService.remove and return the correct message if all goes well', async () => {
      (mockUserService.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (mockUserService.remove as jest.Mock).mockResolvedValue({});

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.ACCOUNT_DELETED,
      }

      const actualResult = await authService.deleteUser(userJamesSmith.id);

      expect(actualResult).toEqual(expectedResult);
      expect(mockUserService.remove).toHaveBeenCalled();
      expect(mockUserService.remove).toHaveBeenCalledWith(userJamesSmith.id);
      expect(mockLoggerService.info).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        LOG_MESSAGES.AUTH.DELETE_USER.SUCCESS(userJamesSmith.email),
        LOG_CONTEXTS.AuthService.deleteUser,
        { userId: userJamesSmith.id, user: userJamesSmith },
      );
    });

  });

});
