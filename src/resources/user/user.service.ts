import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {
    
  }

  // create user
  async create(createUserDto: RegisterUserDto): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(newUser);
  }

  // get all users
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  // get one user by id
  async findOneById(id: string): Promise<User> {
    return await this.usersRepository.findOne({where: {id}});
  }

  // get one user by email
  async findOneByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({where: {email}});
  }

  // update user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return await this.usersRepository.findOne({where: {id}});
  }

  async markUserAccountAsVerified(user: User) {
    user.emailVerified = true;
    return await this.usersRepository.save(user);
  }

  // delete user
  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

}
