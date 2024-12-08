import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {

  }

  // create user
  async create(createUserDto: RegisterUserDto): Promise<User> {
    const newUser = await this.userRepository.create({
      ...createUserDto,
      createdAt: new Date(),
    });
    return await this.userRepository.save(newUser);
  }

  // get all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // get one user by id
  async findOneById(id: string): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  // get one user by email
  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // update user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return await this.userRepository.findOne({ where: { id } });
  }

  async markUserAccountAsVerified(user: User) {
    user.emailVerified = true;
    return await this.userRepository.save(user);
  }

  // delete user
  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

}
