import { BadRequestException, ConflictException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { UserService } from 'src/resources/user/user.service';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { LogInUserDto } from './dto/log-in-user.dto';
import { User } from 'src/resources/user/entities/user.entity';
import { EmailService } from 'src/services/email/email.service';
import customMessage from 'src/shared/customMessage.response';
import { validate as isValidUUID } from 'uuid';
import { TokenService } from 'src/services/token/token.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly objectValidationService: ObjectValidationService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) { }

  async validateUser(user: LogInUserDto) {
    const foundUser = await this.userService.findOneByEmail(user.email);

    if (!foundUser) {
      return null;
    }

    const matched = await compare(user.password, foundUser.password);

    if (!matched) {
      return null;
    }

    return foundUser;
  }

  async registerUser(newUser: RegisterUserDto) {
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
      throw new BadRequestException(`missing properties: ${missingProperties}`);
    }

    // Check if user email already exists
    if (await this.userService.findOneByEmail(newUser.email)) {
      throw new ConflictException('email already registered');
    }

    // Check if passwords match
    if (newUser.password !== newUser.passwordConfirmation) {
      throw new BadRequestException('passwords don\'t match');
    }

    // Create new user
    try {
      newUser.password = await hash(newUser.password, 12);
      const user = await this.userService.create(newUser);
      var payload = {id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname};
      var token: string = this.tokenService.createToken(payload);
      var link: string = 'http://localhost:3001/auth/verify-user/' + user.id + "/" + token;
      if (await this.emailService.sendRegistrationEmail(user.email, user.firstname + " " + user.lastname, link)) {
        //return await this.findById(user.id);
        return customMessage(
          HttpStatus.OK,
          'you will receive a registration email shortly',
        );
      }

      throw new ServiceUnavailableException('service is unavailable');
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('something went wrong, please try again later')
    }
  }

  async verifyUser(id: string, token: string) {
    if (!isValidUUID(id)) {
      throw new BadRequestException('invalid user id');
    }

    const user = await this.userService.findOneById(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    try {
      this.tokenService.verifyToken(token);
    } catch (err) {
      throw new ForbiddenException('expired or invalid token: ' + err);
    }

    const isUpdated = await this.userService.markUserAccountAsVerified(user);

    if (isUpdated) {
      return customMessage(
        HttpStatus.OK,
        'user verified successfully'
      )
    }

    throw new ServiceUnavailableException('something went wrong, please try again later')
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    const { password: _, ...user } = await this.userService.findOneById(id);
    return user;
  }

  async findByEmail(email: string): Promise<Omit<User, 'password'>> {
    const { password: _, ...user } = await this.userService.findOneByEmail(email);
    return user;
  }

  async deleteUser(id: string) {
    return await this.userService.delete(id);
  }

}
