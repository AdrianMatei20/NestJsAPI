import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { validate as isValidUUID } from 'uuid';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { ProjectDto } from './dto/project.dto';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProjectService {

  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    private readonly userService: UserService,
    private readonly objectValidationService: ObjectValidationService,
  ) {

  }

  async create(newProject: CreateProjectDto, userId: string): Promise<CustomMessageDto<ProjectDto>> {
    // Check if request body is valid
    const schema: Record<keyof CreateProjectDto, string> = {
      name: 'string',
      description: 'string',
    }
    const missingProperties: string[] = this.objectValidationService.getMissingProperties(newProject, schema);
    if (missingProperties.length > 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `missing properties: ${missingProperties}`,
      });
    }

    // Check if the user exists
    const user: User = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    const project: Project = this.projectRepository.create({
      ...newProject,
      createdAt: new Date(),
      owner: user,
    });

    if (await this.projectRepository.save(project)) {
      return {
        statusCode: HttpStatus.OK,
        message: 'project created',
        data: {
          id: project.id,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt,
          ownerId: project.owner.id,
        },
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'couldn\'t create project',
    };
  }

  async findAll() {
    return await this.projectRepository.find();
  }

  async findAllByUserId(userId: string): Promise<CustomMessageDto<ProjectDto[]>> {
    // Check if the id is a valid UUID
    if (!isValidUUID(userId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid user id',
      });
    }

    // Check if user exists
    var user: User = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    var projects: Project[] = await this.projectRepository.find({
      where: { owner: { id: userId } },
      relations: { owner: true }
    });

    return {
      statusCode: HttpStatus.OK,
      message: `${projects.length} project${projects.length == 1 ? '' : 's'} found`,
      data: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        ownerId: project.owner.id,
      })),
    };
  }

  async findOneById(id: string): Promise<CustomMessageDto<ProjectDto>> {
    // Check if the id is a valid UUID
    if (!isValidUUID(id)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid project id',
      });
    }

    // Check if project exists
    const project: Project = await this.projectRepository.findOne({
      where: { id },
      relations: { owner: true }
    });

    if (!project) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'project not found',
      });
    }

    return {
      statusCode: 200,
      message: 'project found',
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        ownerId: project.owner.id,
      }
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<CustomMessageDto<ProjectDto>> {
    // Check if the id is a valid UUID
    if (!isValidUUID(id)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid project id',
      });
    }

    // Check if project exists
    var project: Project = await this.projectRepository.findOne({where: {id}});

    if (!project) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'project not found',
      });
    }

    try {

      await this.projectRepository.update(id, updateProjectDto);
      var updatedProject: Project = await this.projectRepository.findOne({
        where: { id },
        relations: { owner: true }
      });

      console.log('updatedProject.id: ' + updatedProject.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'project updated',
        data: {
          id: updatedProject.id,
          name: updatedProject.name,
          description: updatedProject.description,
          createdAt: updatedProject.createdAt,
          ownerId: updatedProject.owner.id,
        },
      };
    } catch (e) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + e,
      });
    }
  }

  async remove(id: string): Promise<SimpleMessageDto> {
    const project: Project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'project not found',
      });
    }

    try {
      await this.projectRepository.delete(id);
      return {
        statusCode: 200,
        message: 'project deleted'
      }
    } catch (e) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + e,
      });
    }
  }
}
