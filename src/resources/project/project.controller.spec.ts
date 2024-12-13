import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CustomMessageDto } from 'src/shared/utils/custom-message.dto';
import { ProjectRoleGuard } from 'src/auth/guards/project-role.guard';
import { SimpleMessageDto } from 'src/shared/utils/simple-message.dto';

describe('ProjectController', () => {
  let projectController: ProjectController;
  let projectServiceMock: any;
  let projectRepositoryMock: any;

  beforeEach(async () => {
    projectServiceMock = {
      create: jest.fn().mockResolvedValue({}),
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
          useValue: projectServiceMock,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: projectRepositoryMock,
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

    it('should call ProjectService.create with the correct arguments', async () => {
      const req = { user: { id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8' } };
      const createProjectDto: CreateProjectDto = {
        name: 'New Project',
        description: 'Project description.',
      };
      const mockResponse = { id: '5108babc-bf35-44d5-a9ba-de08badfa80a', ...createProjectDto };

      (projectServiceMock.create as jest.Mock).mockResolvedValue(mockResponse);

      const result = await projectController.create(req, createProjectDto);

      expect(projectServiceMock.create).toHaveBeenCalledWith(
        createProjectDto,
        req.user.id,
      );
      expect(result).toEqual(mockResponse);
    });

  });

  describe('GET /projects (findAll)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.findAll);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(1);
      expect(guards[0]).toBe(AuthenticatedGuard);
    });

    it('should call ProjectService.findAll with the correct arguments', async () => {
      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userChristopherAnderson = {
        id: '08c71152-c552-42e7-b094-f510ff44e9cb',
        firstname: "Christopher",
        lastname: "Anderson",
        email: "christopheranderson@fakemail.com",
      };

      const userRonaldClark = {
        id: 'c558a80a-f319-4c10-95d4-4282ef745b4b',
        firstname: "Ronald",
        lastname: "Clark",
        email: "ronaldclark@fakemail.com",
      };

      const projectOne: ProjectDto = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        owner: userJamesSmith,
      };

      const projectTwo: ProjectDto = {
        id: '2d790a4d-7c9c-4e23-9c9c-5749c5fa7fdb',
        name: 'Project Two',
        description: 'Second project description.',
        createdAt: new Date('2024-02-01T12:00:00Z'),
        owner: userChristopherAnderson,
      };

      const projectThree: ProjectDto = {
        id: '8304e5ff-6324-4863-ac51-8fcbc6812b13',
        name: 'Project Three',
        description: 'Third project description.',
        createdAt: new Date('2024-03-01T12:00:00Z'),
        owner: userRonaldClark,
      };

      const projectFour: ProjectDto = {
        id: '8304e5ff-6324-4863-ac51-8fcbc6812b13',
        name: 'Project Four',
        description: 'Fourth project description.',
        createdAt: new Date('2024-04-01T12:00:00Z'),
        owner: userRonaldClark,
      };

      const req = { user: { id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8' } };
      const projects = [projectOne, projectTwo, projectThree, projectFour];

      (projectServiceMock.findAllByUserId as jest.Mock).mockResolvedValue(projects);

      const result = await projectController.findAll(req);

      expect(projectServiceMock.findAllByUserId).toHaveBeenCalledWith(
        req.user.id,
      );
      expect(result).toEqual(projects);
    });

  });

  describe('GET /projects/:id (findOne)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.findOne);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(1);
      expect(guards[0]).toBe(AuthenticatedGuard);
    });

    it('should call ProjectService.findOne with the correct arguments', async () => {
      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const project: ProjectDto = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        owner: userJamesSmith,
      };

      const req = { user: { id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8' } };

      (projectServiceMock.findOneById as jest.Mock).mockResolvedValue(project);

      const result = await projectController.findOne(project.id);

      expect(projectServiceMock.findOneById).toHaveBeenCalledWith(
        project.id,
      );
      expect(result).toEqual(project);
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

    it('should call ProjectService.update with the correct arguments', async () => {
      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const project: ProjectDto = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        owner: userJamesSmith,
      };

      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project One',
        description: 'Updated first project description.',
      };

      const updatedProject: ProjectDto = {
        id: project.id,
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        createdAt: project.createdAt,
        owner: userJamesSmith,
      };

      const mockResult: CustomMessageDto<ProjectDto> = {
        statusCode: 200,
        message: 'project updated',
        data: updatedProject,
      }

      const req = { user: { id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8' } };

      (projectServiceMock.update as jest.Mock).mockResolvedValue(mockResult);

      const result = await projectController.update(project.id, updateProjectDto);

      expect(projectServiceMock.update).toHaveBeenCalledWith(
        project.id,
        updateProjectDto,
      );
      expect(result).toEqual(mockResult);
    });

  });

  describe('DELETE /projects/:id (remove)', () => {

    it('should have AuthenticatedGuard applied to the create endpoint', () => {
      const guards = Reflect.getMetadata('__guards__', projectController.remove);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(1);
      expect(guards[0]).toBe(AuthenticatedGuard);
    });

    it('should call ProjectService.remove with the correct arguments', async () => {
      const mockResult: SimpleMessageDto = {
        statusCode: 200,
        message: 'project deleted',
      };

      (projectServiceMock.remove as jest.Mock).mockResolvedValue(mockResult);

      const result = await projectController.remove('5108babc-bf35-44d5-a9ba-de08badfa80a');

      expect(projectServiceMock.remove).toHaveBeenCalledWith(
        '5108babc-bf35-44d5-a9ba-de08badfa80a',
      );
      expect(result).toEqual(mockResult);
    });

  });

});
