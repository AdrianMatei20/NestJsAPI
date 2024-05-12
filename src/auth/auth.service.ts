import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { UserService } from 'src/resources/user/user.service';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { LogInUserDto } from './dto/log-in-user.dto';
import { User } from 'src/resources/user/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly objectValidationService: ObjectValidationService,
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
    
    newUser.password = await hash(newUser.password, 12);
    const user = await this.userService.create(newUser);

    return await this.findById(user.id);
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    const { password: _, ...user} = await this.userService.findOneById(id);
    return user;
  }

  async findByEmail(email: string): Promise<Omit<User, 'password'>> {
    const { password: _, ...user} = await this.userService.findOneByEmail(email);
    return user;
  }

  async deleteUser(id: string) {
    return await this.userService.delete(id);
  }

}
