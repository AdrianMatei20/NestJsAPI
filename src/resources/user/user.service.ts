import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) { }

  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const newUser = this.userRepository.create({
      ...registerUserDto,
      createdAt: new Date(),
    });

    await this.userRepository.save(newUser);

    const createdUser: User = await this.userRepository.findOne({
      where: { id: newUser.id },
    });

    return createdUser;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return Array.isArray(users) ? users : [];
  }

  async findOneById(userId: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email }
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return await this.userRepository.findOne({ where: { id } });
  }

  async markUserAccountAsVerified(user: User) {
    user.emailVerified = true;
    return await this.userRepository.save(user);
  }

  async remove(userId: string): Promise<Boolean> {
    var user: User = await this.userRepository.findOne({ where: { id: userId } });
    await this.userRepository.delete(userId);
    return true;
  }

}
