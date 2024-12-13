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
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class ProjectService {

  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(UserProjectRole) private userProjectRoleRepository: Repository<UserProjectRole>,
    private readonly userService: UserService,
    private readonly objectValidationService: ObjectValidationService,
    private readonly loggerService: LoggerService,
  ) {

  }

  async create(newProject: CreateProjectDto, userId: string): Promise<CustomMessageDto<ProjectDto>> {
    // Check if user exists
    let user: User = null;
    try {
      user = await this.userService.findOneById(userId);
    } catch (error) {
      await this.loggerService.error(`Failed to find user with id ${userId}.`, 'ProjectService.create', error.message, { newProject, userId });
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
      });
    }
    if (!user) {
      await this.loggerService.warn(`Could not create project "${newProject.name}". User with id ${userId} not found.`, 'ProjectService.create', { newProject, userId });
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    // Check if request body is valid
    const schema: Record<keyof CreateProjectDto, string> = {
      name: 'string',
      description: 'string',
    }
    const missingProperties: string[] = this.objectValidationService.getMissingProperties(newProject, schema);
    if (missingProperties.length > 0) {
      await this.loggerService.warn(`Could not create project. Missing properties: ${missingProperties}.`, 'ProjectService.create', { newProject, userId });
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `missing properties: ${missingProperties}`,
      });
    }

    try {
      const project: Project = this.projectRepository.create({
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

      await this.loggerService.info(`Created project: "${project.name}"`, 'ProjectService.create', { newProject, userId });

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
    } catch (error) {
      await this.loggerService.error(`Failed to create project "${newProject.name}".`, 'ProjectService.create', error.message, { newProject, userId });
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
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
      await this.loggerService.warn(`Could not retrieve user's projects. The provided user id (${userId}) was not a valid UUID.`, 'ProjectService.findAllByUserId', userId);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid user id',
      });
    }

    // Check if user exists
    var user: User = null;
    try {
      user = await this.userService.findOneById(userId);
    } catch (error) {
      await this.loggerService.error(`Failed to find user with id ${userId}.`, 'ProjectService.findAllByUserId', error.message, userId);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
      });
    }
    if (!user) {
      await this.loggerService.warn(`Could not retrieve user's projects. User with id ${userId} not found.`, 'ProjectService.findAllByUserId', userId);
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'user not found',
      });
    }

    try {

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

    } catch (error) {
      await this.loggerService.error(`Failed to retrieve user's projects.`, 'ProjectService.findAllByUserId', error.message, userId);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
      });
    }
  }

  async findOneById(projectId: string): Promise<CustomMessageDto<ProjectDto>> {
    // Check if the id is a valid UUID
    if (!isValidUUID(projectId)) {
      await this.loggerService.warn(`Could not retrieve project. The provided project id (${projectId}) was not a valid UUID.`, 'ProjectService.findOneById', projectId);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid project id',
      });
    }

    // Check if project exists
    var project: Project = null;
    try {
      project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['userProjectRole', 'userProjectRole.user']
      });
    } catch (error) {
      await this.loggerService.error(`Failed to find project with id ${projectId}.`, 'ProjectService.findOneById', error.message, projectId);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
      });
    }
    if (!project) {
      await this.loggerService.warn(`Could not retreive project. Project with id ${projectId} not found.`, 'ProjectService.findOneById', projectId);
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

  async update(projectId: string, updateProjectDto: UpdateProjectDto): Promise<CustomMessageDto<ProjectDto>> {
    // Check if the id is a valid UUID
    if (!isValidUUID(projectId)) {
      await this.loggerService.warn(`Could not update project. The provided project id (${projectId}) was not a valid UUID.`, 'ProjectService.update', { id: projectId, updateProjectDto });
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid project id',
      });
    }

    // Check if project exists
    var project: Project = null;
    try {
      project = await this.projectRepository.findOne({ 
        where: { id: projectId },
        relations: { userProjectRole: true },
       });
    } catch (error) {
      await this.loggerService.error(`Failed to find project with id ${projectId}.`, 'ProjectService.update', error.message, projectId);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
      });
    }
    if (!project) {
      await this.loggerService.warn(`Could not update project. Project with id ${projectId} not found.`, 'ProjectService.update', { id: projectId, updateProjectDto });
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'project not found',
      });
    }

    // Check if request body is valid
    const schema: Record<keyof CreateProjectDto, string> = {
      name: 'string',
      description: 'string',
    }
    const missingProperties: string[] = this.objectValidationService.getMissingProperties(updateProjectDto, schema);
    if (missingProperties.length === 2) {
      await this.loggerService.warn(`Could not update project "${project.name}". Missing properties: ${missingProperties}.`, 'ProjectService.update', { id: projectId, updateProjectDto });
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `missing properties: ${missingProperties}`,
      });
    }

    try {

      await this.projectRepository.update(projectId, updateProjectDto);

      var updatedProject: Project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['userProjectRole', 'userProjectRole.user'],
      });

      await this.loggerService.info(`Updated project: ${updatedProject.name}`, 'ProjectService.update', { id: projectId, project, updateProjectDto });

      const owner = updatedProject.userProjectRole.find(userProjectRole => userProjectRole.projectRole === ProjectRole.OWNER.toString()).user;

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
    } catch (error) {
      await this.loggerService.error(`Failed to update project "${project.name}".`, 'ProjectService.update', error.message, { id: projectId, project, updateProjectDto });
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
      });
    }
  }

  async remove(projectId: string): Promise<SimpleMessageDto> {
    // Check if the id is a valid UUID
    if (!isValidUUID(projectId)) {
      await this.loggerService.warn(`Could not delete project. The provided project id (${projectId}) was not a valid UUID.`, 'ProjectService.remove', projectId);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'invalid project id',
      });
    }

    // Check if project exists
    var project: Project = null;
    try{
      project = await this.projectRepository.findOne({where: { id: projectId }});  
    } catch (error) {
      await this.loggerService.error(`Failed to find project with id ${projectId}.`, 'ProjectService.remove', error.message, projectId);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
      });
    }
    if (!project) {
      await this.loggerService.warn(`Could not delete project. Project with id ${projectId} not found.`, 'ProjectService.remove', projectId);
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'project not found',
      });
    }

    try {
      await this.projectRepository.delete(projectId);
      await this.loggerService.info(`Deleted project: "${project.name}"`, 'ProjectService.remove', projectId);
      return {
        statusCode: 200,
        message: 'project deleted'
      }
    } catch (error) {
      await this.loggerService.error(`Failed to delete project "${project.name}".`, 'ProjectService.remove', error.message, projectId);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'something went wrong, please try again later: ' + error.message,
      });
    }
  }
}
