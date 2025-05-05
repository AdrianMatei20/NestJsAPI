import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { PublicProjectDto } from './dto/public-project.dto';
import { ProjectRoleGuard } from 'src/auth/guards/project-role.guard';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { ForbiddenException, HttpStatus } from '@nestjs/common';
import { createProjectDto, JamesOwnerAndChristopherMember, project, projects, updateProjectDto } from 'test/data/projects';
import { adminRequest, regularUserRequest, unknownRoleRequest } from 'test/data/requests';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { RETURN_MESSAGES } from 'src/constants/return-messages';

describe('ProjectController', () => {
  let projectController: ProjectController;
  let mockProjectService: any;
  let mockProjectRepository: any;

  beforeEach(async () => {
    mockProjectService = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue([]),
      findAllByUserId: jest.fn().mockResolvedValue({}),
      findOneById: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    projectController = module.get<ProjectController>(ProjectController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(projectController).toBeDefined();
  });

  describe('POST /projects (create)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.create);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(1);
      expect(guards[0]).toBe(AuthenticatedGuard);
      expect(guards.length).toBe(1);
    });

    it('should return PublicProjectDto for admin requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      const expectedResult: CustomMessageDto<Project | PublicProjectDto> = {
        statusCode: HttpStatus.CREATED,
        message: RETURN_MESSAGES.CREATED.PROJECT,
        data: new PublicProjectDto(project),
      };

      const actualResult = await projectController.create(adminRequest, createProjectDto);

      expect(mockProjectService.create).toHaveBeenCalledWith(
        createProjectDto,
        adminRequest.user.id,
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it('should return PublicProjectDto for regular user requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      const expectedResult: CustomMessageDto<Project | PublicProjectDto> = {
        statusCode: HttpStatus.CREATED,
        message: RETURN_MESSAGES.CREATED.PROJECT,
        data: new PublicProjectDto(project),
      };

      const actualResult = await projectController.create(regularUserRequest, createProjectDto);

      expect(mockProjectService.create).toHaveBeenCalledWith(
        createProjectDto,
        regularUserRequest.user.id,
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it('should return 403 Forbidden for unknown role requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      await expect(projectController.create(unknownRoleRequest, createProjectDto))
        .rejects.toThrow(ForbiddenException);

      try {
        await projectController.create(unknownRoleRequest, createProjectDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }
    });

  });

  describe('GET /projects (findAll)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.findAll);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(1);
      expect(guards[0]).toBe(AuthenticatedGuard);
    });

    it('should call projectService.findAll and return empty Project array for admin requests if no projects are found', async () => {
      (mockProjectService.findAll as jest.Mock).mockResolvedValue([]);

      const expectedResult: CustomMessageDto<Project[] | PublicProjectDto[]> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.N_PROJECTS_FOUND(0),
        data: [],
      };

      const actualResult = await projectController.findAll(adminRequest);

      expect(mockProjectService.findAll).toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).not.toHaveBeenCalled();
      expect(expectedResult).toEqual(actualResult);
    });

    it('should call projectService.findAll and return Project array for admin requests if only one project is found', async () => {
      (mockProjectService.findAll as jest.Mock).mockResolvedValue([project]);

      const expectedResult: CustomMessageDto<Project[] | PublicProjectDto[]> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.N_PROJECTS_FOUND(1),
        data: [new PublicProjectDto(project)],
      };

      const actualResult = await projectController.findAll(adminRequest);

      expect(mockProjectService.findAll).toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).not.toHaveBeenCalled();
      expect(actualResult).toEqual(expectedResult);
    });

    it('should call projectService.findAll and return Project array for admin requests if multiple projects are found', async () => {
      (mockProjectService.findAll as jest.Mock).mockResolvedValue(projects);

      const expectedResult: CustomMessageDto<Project[] | PublicProjectDto[]> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.N_PROJECTS_FOUND(projects.length),
        data: projects.map(project => new PublicProjectDto(project)),
      };

      const actualResult = await projectController.findAll(adminRequest);

      expect(mockProjectService.findAll).toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).not.toHaveBeenCalled();
      expect(actualResult).toEqual(expectedResult);
    });

    it('should call projectService.findAll and return empty Project array for regular user requests if no projects are found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue([]);

      const expectedResult: CustomMessageDto<Project[] | PublicProjectDto[]> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.N_PROJECTS_FOUND(0),
        data: [],
      };

      const actualResult = await projectController.findAll(regularUserRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(actualResult).toEqual(expectedResult);
    });

    it('should call projectService.findAll and return Project array for regular user requests if only one project is found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue([project]);

      const expectedResult: CustomMessageDto<Project[] | PublicProjectDto[]> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.N_PROJECTS_FOUND(1),
        data: [new PublicProjectDto(project)],
      };

      const actualResult = await projectController.findAll(regularUserRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(actualResult).toEqual(expectedResult);
    });

    it('should call projectService.findAll and return Project array for regular user requests if multiple projects are found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue(projects);

      const expectedResult: CustomMessageDto<Project[] | PublicProjectDto[]> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.N_PROJECTS_FOUND(projects.length),
        data: projects.map(project => new PublicProjectDto(project)),
      };

      const actualResult = await projectController.findAll(regularUserRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(actualResult).toEqual(expectedResult);
    });

    it('should return 403 Forbidden for unknown role requests', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue([]);

      await expect(projectController.findAll(unknownRoleRequest))
        .rejects.toThrow(ForbiddenException);

      try {
        await projectController.findAll(unknownRoleRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }
    });

  });

  describe('GET /projects/:id (findOne)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.findOne);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(2);
      expect(guards[0]).toBe(ProjectRoleGuard);
      expect(guards[1]).toBe(AuthenticatedGuard);
    });

    it('should call projectService.findOneById and return Project for admin requests if project is found', async () => {
      (mockProjectService.findOneById as jest.Mock).mockResolvedValue(project);

      const expectedResult: CustomMessageDto<Project | PublicProjectDto> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.PROJECT_FOUND,
        data: new PublicProjectDto(project),
      };

      const actualResult = await projectController.findOne(adminRequest, project.id);

      expect(mockProjectService.findOneById).toHaveBeenCalled();
      expect(actualResult).toEqual(expectedResult);
    });

    it('should call projectService.findOneById and return Project for regular user requests if project is found', async () => {
      (mockProjectService.findOneById as jest.Mock).mockResolvedValue(project);

      const expectedResult: CustomMessageDto<Project | PublicProjectDto> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.PROJECT_FOUND,
        data: new PublicProjectDto(project),
      };

      const actualResult = await projectController.findOne(regularUserRequest, project.id);

      expect(mockProjectService.findOneById).toHaveBeenCalled();
      expect(actualResult).toEqual(expectedResult);
    });

    it('should return 403 Forbidden for unknown role requests', async () => {
      (mockProjectService.findOneById as jest.Mock).mockResolvedValue(project);

      await expect(projectController.findOne(unknownRoleRequest, project.id))
        .rejects.toThrow(ForbiddenException);

      try {
        await projectController.findOne(unknownRoleRequest, project.id);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }
    });

  });

  describe('PATCH /project/:id (update)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.update);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(2);
      expect(guards[0]).toBe(ProjectRoleGuard);
      expect(guards[1]).toBe(AuthenticatedGuard);
    });

    it('should call projectService.update and return updated project for admin requests', async () => {
      const updatedProject: Project = {
        id: project.id,
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        createdAt: project.createdAt,
        userProjectRoles: JamesOwnerAndChristopherMember,
      };

      (mockProjectService.update as jest.Mock).mockResolvedValue(updatedProject);

      const expectedResult: CustomMessageDto<Project | PublicProjectDto> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.PROJECT_UPDATED,
        data: updatedProject,
      };

      const actualResult = await projectController.update(adminRequest, project.id, updateProjectDto);

      expect(mockProjectService.update).toHaveBeenCalledWith(
        project.id,
        updateProjectDto,
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it('should call projectService.update and return updated project for regular users requests', async () => {
      const updatedProject: Project = {
        id: project.id,
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        createdAt: project.createdAt,
        userProjectRoles: JamesOwnerAndChristopherMember,
      };

      (mockProjectService.update as jest.Mock).mockResolvedValue(updatedProject);

      const expectedResult: CustomMessageDto<Project | PublicProjectDto> = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.PROJECT_UPDATED,
        data: new PublicProjectDto(updatedProject),
      };

      const actualResult = await projectController.update(regularUserRequest, project.id, updateProjectDto);

      expect(mockProjectService.update).toHaveBeenCalledWith(
        project.id,
        updateProjectDto,
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it('should return 403 Forbidden for unkown role requests', async () => {
      await expect(projectController.update(unknownRoleRequest, project.id, updateProjectDto))
        .rejects.toThrow(ForbiddenException);

      try {
        await projectController.update(unknownRoleRequest, project.id, updateProjectDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({
          statusCode: HttpStatus.FORBIDDEN,
          message: RETURN_MESSAGES.FORBIDDEN.INCORRECT_ROLE,
        });
      }
    });

  });

  describe('DELETE /projects/:id (remove)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.remove);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(2);
      expect(guards[0]).toBe(ProjectRoleGuard);
      expect(guards[1]).toBe(AuthenticatedGuard);
    });

    it('should call ProjectService.remove with the correct arguments', async () => {
      (mockProjectService.remove as jest.Mock).mockResolvedValue(true);

      const expectedResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: RETURN_MESSAGES.OK.PROJECT_DELETED,
      };

      const actualResult = await projectController.remove(project.id);

      expect(mockProjectService.remove).toHaveBeenCalledWith(
        project.id,
      );
      expect(actualResult).toEqual(expectedResult);
    });

  });

});
