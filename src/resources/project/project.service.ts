import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class ProjectService {

  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    private readonly userService: UserService,
  ) {
    
  }

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const newProject = this.projectRepository.create({
      ...createProjectDto,
      createdAt: new Date(),
      owner: await this.userService.findOneById(userId),
    });
    return await this.projectRepository.save(newProject);
  }

  async findAll() {
    return await this.projectRepository.find();
  }

  async findAllByUserId(userId: string) {
    return await this.projectRepository.find({
      where: {
        owner: {
          id: userId
        },
      },
      relations: {
        owner: true,
      }
    });
  }

  async findOneById(id: string) {
    return await this.projectRepository.find({
      where: {id},
      relations: {
        owner: true,
      }
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.projectRepository.update(id, updateProjectDto);
    return await this.projectRepository.findOne({where: {id}});
  }

  async remove(id: string) {
    await this.projectRepository.delete(id);
  }
}
