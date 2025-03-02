import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { PublicProjectDto } from './dto/project.dto';
import { ProjectRoleGuard } from 'src/auth/guards/project-role.guard';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';
import { HttpStatus } from '@nestjs/common';
import { createProjectDto, JamesOwnerAndChristopherMember, project, projects, updateProjectDto } from 'test/data/projects';
import { adminRequest, regularUserRequest, unknownRoleRequest } from 'test/data/requests';

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

    it('should return ProjectDto for admin requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      const result = await projectController.create(adminRequest, createProjectDto);

      expect(mockProjectService.create).toHaveBeenCalledWith(
        createProjectDto,
        adminRequest.user.id,
      );
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual('project created');
      expect(result.data).toEqual(project);
    });

    it('should return PublicProjectDto array for regular user requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      const result = await projectController.create(regularUserRequest, createProjectDto);

      expect(mockProjectService.create).toHaveBeenCalledWith(
        createProjectDto,
        regularUserRequest.user.id,
      );
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual('project created');
      expect(result.data).toEqual(new PublicProjectDto(project));
    });

    it('should return PublicProjectDto array for unknown role requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      const result = await projectController.create(unknownRoleRequest, createProjectDto);

      expect(mockProjectService.create).toHaveBeenCalledWith(
        createProjectDto,
        unknownRoleRequest.user.id,
      );
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual('project created');
      expect(result.data).toEqual(new PublicProjectDto(project));
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

      const result = await projectController.findAll(adminRequest);

      expect(mockProjectService.findAll).toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).not.toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('0 projects found');
      expect(result.data).toEqual([]);
    });

    it('should call projectService.findAll and return Project array for admin requests if only one project is found', async () => {
      (mockProjectService.findAll as jest.Mock).mockResolvedValue([project]);

      const result = await projectController.findAll(adminRequest);

      expect(mockProjectService.findAll).toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).not.toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('1 project found');
      expect(result.data).toEqual([project]);
    });

    it('should call projectService.findAll and return Project array for admin requests if multiple projects are found', async () => {
      (mockProjectService.findAll as jest.Mock).mockResolvedValue(projects);

      const result = await projectController.findAll(adminRequest);

      expect(mockProjectService.findAll).toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).not.toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual(`${projects.length} projects found`);
      expect(result.data).toEqual(projects);
    });

    it('should call projectService.findAll and return empty Project array for regular user requests if no projects are found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue([]);

      const result = await projectController.findAll(regularUserRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('0 projects found');
      expect(result.data).toEqual([]);
    });

    it('should call projectService.findAll and return Project array for regular user requests if only one project is found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue([project]);

      const result = await projectController.findAll(regularUserRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('1 project found');
      expect(result.data).toEqual([new PublicProjectDto(project)]);
    });

    it('should call projectService.findAll and return Project array for regular user requests if multiple projects are found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue(projects);

      const result = await projectController.findAll(regularUserRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual(`${projects.length} projects found`);
      expect(result.data).toEqual(projects.map(project => new PublicProjectDto(project)));
    });

    it('should call projectService.findAll and return empty Project array for unknown role requests if no projects are found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue([]);

      const result = await projectController.findAll(unknownRoleRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('0 projects found');
      expect(result.data).toEqual([]);
    });

    it('should call projectService.findAll and return Project array for unknown role requests if only one project is found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue([project]);

      const result = await projectController.findAll(unknownRoleRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('1 project found');
      expect(result.data).toEqual([new PublicProjectDto(project)]);
    });

    it('should call projectService.findAll and return Project array for unknown role requests if multiple projects are found', async () => {
      (mockProjectService.findAllByUserId as jest.Mock).mockResolvedValue(projects);

      const result = await projectController.findAll(unknownRoleRequest);

      expect(mockProjectService.findAll).not.toHaveBeenCalled();
      expect(mockProjectService.findAllByUserId).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual(`${projects.length} projects found`);
      expect(result.data).toEqual(projects.map(project => new PublicProjectDto(project)));
    });

  });

  describe('GET /projects/:id (findOne)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.findOne);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(1);
      expect(guards[0]).toBe(AuthenticatedGuard);
    });

    it('should call projectService.findOneById and return Project for admin requests if project is found', async () => {
      (mockProjectService.findOneById as jest.Mock).mockResolvedValue(project);

      const result = await projectController.findOne(adminRequest, project.id);

      expect(mockProjectService.findOneById).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('project found');
      expect(result.data).toEqual(project);
    });

    it('should call projectService.findOneById and return Project for regular user requests if project is found', async () => {
      (mockProjectService.findOneById as jest.Mock).mockResolvedValue(project);

      const result = await projectController.findOne(regularUserRequest, project.id);

      expect(mockProjectService.findOneById).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('project found');
      expect(result.data).toEqual(new PublicProjectDto(project));
    });

    it('should call projectService.findOneById and return Project for unknown role requests if project is found', async () => {
      (mockProjectService.findOneById as jest.Mock).mockResolvedValue(project);

      const result = await projectController.findOne(unknownRoleRequest, project.id);

      expect(mockProjectService.findOneById).toHaveBeenCalled();
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('project found');
      expect(result.data).toEqual(new PublicProjectDto(project));
    });

  });

  describe('PATCH /projects/:id (update)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.update);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(2);
      expect(guards[0]).toBe(ProjectRoleGuard);
      expect(guards[1]).toBe(AuthenticatedGuard);
    });

    it('should return Project array for admin requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      const result = await projectController.create(adminRequest, createProjectDto);

      expect(mockProjectService.create).toHaveBeenCalledWith(
        createProjectDto,
        adminRequest.user.id,
      );
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual('project created');
      expect(result.data).toEqual(project);
    });

    it('should return PublicProjectDto array for regular user requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      const result = await projectController.create(regularUserRequest, createProjectDto);

      expect(mockProjectService.create).toHaveBeenCalledWith(
        createProjectDto,
        regularUserRequest.user.id,
      );
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual('project created');
      expect(result.data).toEqual(new PublicProjectDto(project));
    });

    it('should return PublicProjectDto array for unknown role requests', async () => {
      (mockProjectService.create as jest.Mock).mockResolvedValue(project);

      const result = await projectController.create(unknownRoleRequest, createProjectDto);

      expect(mockProjectService.create).toHaveBeenCalledWith(
        createProjectDto,
        unknownRoleRequest.user.id,
      );
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual('project created');
      expect(result.data).toEqual(new PublicProjectDto(project));
    });

  });

  describe('GET /projects (findAll)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.findAll);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(1);
      expect(guards[0]).toBe(AuthenticatedGuard);
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

      const result = await projectController.update(adminRequest, project.id, updateProjectDto);

      expect(mockProjectService.update).toHaveBeenCalledWith(
        project.id,
        updateProjectDto,
      );
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('project updated');
      expect(result.data).toEqual(updatedProject);
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

      const result = await projectController.update(regularUserRequest, project.id, updateProjectDto);

      expect(mockProjectService.update).toHaveBeenCalledWith(
        project.id,
        updateProjectDto,
      );
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('project updated');
      expect(result.data).toEqual(new PublicProjectDto(updatedProject));
    });

    it('should call projectService.update and return updated project for unkown role requests', async () => {
      const updatedProject: Project = {
        id: project.id,
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        createdAt: project.createdAt,
        userProjectRoles: JamesOwnerAndChristopherMember,
      };

      (mockProjectService.update as jest.Mock).mockResolvedValue(updatedProject);

      const result = await projectController.update(unknownRoleRequest, project.id, updateProjectDto);

      expect(mockProjectService.update).toHaveBeenCalledWith(
        project.id,
        updateProjectDto,
      );
      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('project updated');
      expect(result.data).toEqual(new PublicProjectDto(updatedProject));
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
      const mockResult: SimpleMessageDto = {
        statusCode: HttpStatus.OK,
        message: 'project deleted',
      };

      (mockProjectService.remove as jest.Mock).mockResolvedValue(true);

      const result = await projectController.remove(project.id);

      expect(mockProjectService.remove).toHaveBeenCalledWith(
        project.id,
      );
      expect(result).toEqual(mockResult);
    });

  });

});
