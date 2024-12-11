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
import { ProjectRole } from './enums/project-role';
import { UserProjectRole } from './entities/user-project-role.entity';
import { AssignUserDto } from './dto/assign-user.dto';
import { UserDto } from '../user/dto/user.dto';

@Injectable()
export class ProjectService {

  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(UserProjectRole) private userProjectRoleRepository: Repository<UserProjectRole>,
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

    try {
      const project: Project = await this.projectRepository.create({
        ...newProject,
        createdAt: new Date(),
      });

      await this.projectRepository.save(project);

      const userProjectRole: AssignUserDto = {
        project: project,
        user: user,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
      }

      await this.userProjectRoleRepository.save(userProjectRole);

      const createdProject: Project = await this.projectRepository.findOne({
        where: { id: project.id },
        relations: ['userProjectRole', 'userProjectRole.user'],
      });

      const foundUserProjectRole: UserProjectRole = createdProject.userProjectRole
        .find(userProjectRole => userProjectRole.projectRole === ProjectRole.OWNER);

      const owner: UserDto = foundUserProjectRole?.user;

      return {
        statusCode: HttpStatus.OK,
        message: 'project created',
        data: {
          id: createdProject.id,
          name: createdProject.name,
          description: createdProject.description,
          createdAt: createdProject.createdAt,
          owner: {
            id: owner.id,
            firstname: owner.firstname,
            lastname: owner.lastname,
            email: owner.email,
          },
        },
      };
    } catch (e) {
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + e,
      });
    }
  }

  async findAll() {
    const projects = await this.projectRepository.find();
    return Array.isArray(projects) ? projects : [];
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

    const userProjectRoles: UserProjectRole[] = await this.userProjectRoleRepository.find({
      relations: {
        user: true,
        project: true,
      }
    });

    const userProjectRolesForUser: UserProjectRole[] = userProjectRoles.filter(userProjectRole =>
      userProjectRole.user.id === userId
    );

    const userProjects: Project[] = userProjectRolesForUser.map(userProjectRole => userProjectRole.project);

    const userProjectsWithOwner = userProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: userProjectRoles.find(userProjectRole => userProjectRole.project.id === project.id && userProjectRole.projectRole === ProjectRole.OWNER)?.user,
    }));

    return {
      statusCode: HttpStatus.OK,
      message: `${userProjects.length} project${userProjects.length == 1 ? '' : 's'} found`,
      data: userProjectsWithOwner.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        owner: {
          id: project.owner.id,
          firstname: project.owner.firstname,
          lastname: project.owner.lastname,
          email: project.owner.email,
        }
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
      relations: ['userProjectRole', 'userProjectRole.user']
    });

    if (!project) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'project not found',
      });
    }

    const owner: User = project.userProjectRole.find(userProjectRole => userProjectRole.projectRole === ProjectRole.OWNER).user;

    return {
      statusCode: 200,
      message: 'project found',
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        owner: {
          id: owner.id,
          firstname: owner.firstname,
          lastname: owner.lastname,
          email: owner.email,
        },
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
    var project: Project = await this.projectRepository.findOne({ where: { id } });

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
        relations: { userProjectRole: true },
      });

      const owner = project.userProjectRole.find(userProjectRole => userProjectRole.projectRole === ProjectRole.OWNER).user;

      return {
        statusCode: HttpStatus.OK,
        message: 'project updated',
        data: {
          id: updatedProject.id,
          name: updatedProject.name,
          description: updatedProject.description,
          createdAt: updatedProject.createdAt,
          owner: {
            id: owner.id,
            firstname: owner.firstname,
            lastname: owner.lastname,
            email: owner.email,
          }
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
    // Check if the id is a valid UUID
    if (!isValidUUID(id)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid project id',
      });
    }

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
