import { BadRequestException, ConflictException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { UserService } from 'src/resources/user/user.service';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { LogInUserDto } from './dto/log-in-user.dto';
import { EmailService } from 'src/services/email/email.service';
import { validate as isValidUUID } from 'uuid';
import { TokenService } from 'src/services/token/token.service';
import { ResetPasswordService } from './reset-password/reset-password.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { UserDto } from 'src/resources/user/dto/user.dto';
import { User } from 'src/resources/user/entities/user.entity';
import { ResetPassword } from './reset-password/reset-password.entity';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly objectValidationService: ObjectValidationService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly resetPasswordService: ResetPasswordService,
  ) { }

  async validateUser(user: LogInUserDto) {
    const foundUser: User = await this.userService.findOneByEmail(user.email);

    if (!foundUser) {
      return null;
    }

    const matched = await compare(user.password, foundUser.password);

    if (!matched) {
      return null;
    }

    return foundUser;
  }

  async registerUser(newUser: RegisterUserDto): Promise<SimpleMessageDto> {
    // Check if request body is valid
    const schema: Record<keyof RegisterUserDto, string> = {
      firstname: 'string',
      lastname: 'string',
      email: 'string',
      password: 'string',
      passwordConfirmation: 'string',
    }
    const missingProperties = this.objectValidationService.getMissingProperties(newUser, schema);
    if (missingProperties.length > 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `missing properties: ${missingProperties}`,
      });
    }

    // Check if user email already exists
    if (await this.userService.findOneByEmail(newUser.email)) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: 'email already registered',
      });
    }

    // Check if passwords match
    if (newUser.password !== newUser.passwordConfirmation) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'passwords don\'t match',
      });
    }

    // Create new user
    try {
      newUser.password = await hash(newUser.password, 12);
      const user: User = await this.userService.create({
        ...newUser,
      });
      var payload = { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname };
      var token: string = this.tokenService.createToken(payload);
      var link: string = 'http://localhost:3001/auth/verify-user/' + user.id + "/" + token;
      if (await this.emailService.sendRegistrationEmail(user.email, user.firstname + " " + user.lastname, link)) {
        return {
          statusCode: HttpStatus.OK,
          message: 'you will receive a registration email shortly',
        };
      }

      throw new ServiceUnavailableException({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'service is unavailable',
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('something went wrong, please try again later')
    }
  }

  async verifyUser(id: string, token: string): Promise<SimpleMessageDto> {
    // Check if the id is a valid UUID
    if (!isValidUUID(id)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid user id',
      });
    }

    // Check if the user exists
    const user: User = await this.userService.findOneById(id);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    // Check if the token is valid
    try {
      this.tokenService.verifyToken(token);
    } catch (err) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'expired or invalid token: ' + err,
      });
    }

    // Mark the account as verified
    const isUpdated: User = await this.userService.markUserAccountAsVerified(user);

    if (isUpdated) {
      return {
        statusCode: HttpStatus.OK,
        message: 'user verified successfully',
      };
    }

    throw new ServiceUnavailableException({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'service is unavailable',
    })
  }

  async sendResetPasswordEmail(id: string): Promise<SimpleMessageDto> {
    const user: User = await this.userService.findOneById(id);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    const token: string = await this.resetPasswordService.createResetToken(user.id);
    const link: string = "http://localhost:3001/auth/'reset-password/" + user.id + "/" + token;

    if (await this.emailService.sendResetPasswordEmail(user.email, user.firstname + " " + user.lastname, link)) {
      return {
        statusCode: HttpStatus.OK,
        message: 'you will receive an email with a password reset link shortly',
      };
    }

    throw new ServiceUnavailableException({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'service is unavailable',
    });
  }

  async sendForgotPasswordEmail(forgotPasswordDto: ForgotPasswordDto): Promise<SimpleMessageDto> {
    const email: string = forgotPasswordDto.email;
    const user: User = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'email address not found',
      });
    }

    const token: string = await this.resetPasswordService.createResetToken(user.id);
    const link: string = "http://localhost:3001/auth/reset-password/" + user.id + "/" + token;

    if (await this.emailService.sendResetPasswordEmail(user.email, user.firstname + " " + user.lastname, link)) {
      return {
        statusCode: HttpStatus.OK,
        message: 'if you are registered, you will receive an email with a password reset link shortly',
      }
    }

    throw new ServiceUnavailableException({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'service is unavailable',
    });
  }

  async resetPassword(id: string, token: string, resetPasswordDto: ResetPasswordDto): Promise<SimpleMessageDto> {
    // Check if the id is a valid UUID
    if (!isValidUUID(id)) {
      throw new BadRequestException('invalid user id');
    }

    // Check if user exists
    var user: User = await this.userService.findOneById(id);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    const isValid: boolean = await this.resetPasswordService.validateResetToken(token);

    if (!isValid) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'expired or invalid token',
      });
    }

    if (resetPasswordDto.password !== resetPasswordDto.passwordConfirmation) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'passwords don\'t match',
      });
    }

    const newPassword: string = await hash(resetPasswordDto.password, 12);
    user.password = newPassword;

    const resetPassword: ResetPassword = await this.resetPasswordService.findByToken(token);

    if (!(await this.userService.update(resetPassword.user.id, user))) {
      throw new ServiceUnavailableException({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'service is unavailable',
      });
    } else {
      await this.resetPasswordService.invalidateResetToken(token);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'password reset successful',
    };
  }

  async findById(id: string): Promise<UserDto> {
    const { password: _, ...user } = await this.userService.findOneById(id);
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    };
  }

  async findByEmail(email: string): Promise<CustomMessageDto<UserDto>> {
    const user: User = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    return {
      statusCode: 200,
      message: '',
      data: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      }
    }
  }

  async deleteUser(id: string): Promise<SimpleMessageDto> {
    const user: User = await this.userService.findOneById(id);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    try {
      await this.userService.delete(id)
      return {
        statusCode: HttpStatus.OK,
        message: 'account deleted',
      };
    } catch (e) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + e,
      });
    }
  }

}
