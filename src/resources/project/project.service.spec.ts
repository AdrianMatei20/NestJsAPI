import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { UserService } from '../user/user.service';
import { ProjectRole } from './enums/project-role';
import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ObjectValidationService } from 'src/services/object-validation.service';
import { Project } from './entities/project.entity';
import { UserProjectRole } from './entities/user-project-role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { LoggerService } from 'src/logger/logger.service';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let userServiceMock: any;
  let projectRepositoryMock: any;
  let userProjectRoleRepositoryMock: any;
  let objectValidationServiceMock: any;
  let loggerServiceMock: any;

  beforeEach(async () => {
    projectRepositoryMock = {
      create: jest.fn().mockResolvedValue({}),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue({}),
    };

    userProjectRoleRepositoryMock = {
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue([]),
    };

    userServiceMock = {
      findOneById: jest.fn().mockResolvedValue({}),
    };

    objectValidationServiceMock = {
      validate: jest.fn().mockResolvedValue(true),
    };

    loggerServiceMock = {
      error: jest.fn().mockResolvedValue({}),
      warn: jest.fn().mockResolvedValue({}),
      info: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        ObjectValidationService,
        {
          provide: getRepositoryToken(Project),
          useValue: projectRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserProjectRole),
          useValue: userProjectRoleRepositoryMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clears mock calls, instances, and results
    jest.resetModules(); // Clears module imports (if needed)
  });

  it('should be defined', () => {
    expect(projectService).toBeDefined();
  });

  describe('create', () => {

    it('should throw InternalServerErrorException if userService.findOneById fails', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test',
        description: 'This is a test project.',
      };

      (userServiceMock.findOneById as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await expect(projectService.create(createProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should throw NotFoundException for unknown user', async () => {
      const createProjectDto: any = {
        name: 'Test',
        description: 'This is a test project.',
      };

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(null);

      await expect(projectService.create(createProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        NotFoundException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw BadRequestException for missing parameter \'name\'', async () => {
      const createProjectDto: Partial<CreateProjectDto> = {
        description: 'This is a test project.',
      };

      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);

      await expect(projectService.create(createProjectDto as CreateProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        BadRequestException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw BadRequestException for missing parameter \'description\'', async () => {
      const createProjectDto: any = {
        name: 'Test',
      }

      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);

      await expect(projectService.create(createProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        BadRequestException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw BadRequestException for missing parameters', async () => {
      const createProjectDto: any = {}

      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      
      await expect(projectService.create(createProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        BadRequestException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if projectRepository.create fails', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test',
        description: 'This is a test project.',
      };

      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const userProjectRole: UserProjectRole = {
        id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
        user: userJamesSmith as User,
        project: project,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
      };

      project.userProjectRole = [userProjectRole];

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (projectRepositoryMock.create as jest.Mock).mockImplementation(() => { throw new Error('Database error'); });
      (projectRepositoryMock.save as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(project);
      (userProjectRoleRepositoryMock.save as jest.Mock).mockResolvedValue(userProjectRole);
      
      await expect(projectService.create(createProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if projectRepository.save fails', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test',
        description: 'This is a test project.',
      };

      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const userProjectRole: UserProjectRole = {
        id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
        user: userJamesSmith as User,
        project: project,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
      };

      project.userProjectRole = [userProjectRole];

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.create as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.save as jest.Mock).mockRejectedValue(new Error('Database error'));
      (userProjectRoleRepositoryMock.save as jest.Mock).mockResolvedValue(userProjectRole);
      
      await expect(projectService.create(createProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if userProjectRoleRepository.save fails', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test',
        description: 'This is a test project.',
      };

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

      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const userProjectRole: UserProjectRole = {
        id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
        user: userJamesSmith as User,
        project: project,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
      };

      project.userProjectRole = [userProjectRole];

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.create as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.save as jest.Mock).mockResolvedValue(project);
      (userProjectRoleRepositoryMock.save as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await expect(projectService.create(createProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should return created project if all goes well', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test',
        description: 'This is a test project.',
      };

      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const userProjectRole: UserProjectRole = {
        id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
        user: userJamesSmith as User,
        project: project,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
      };

      project.userProjectRole = [userProjectRole];

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.create as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.save as jest.Mock).mockResolvedValue(project);
      (userProjectRoleRepositoryMock.save as jest.Mock).mockResolvedValue(userProjectRole);

      const result = await projectService.create(createProjectDto, 'af7c1fe6-d669-414e-b066-e9733f0de7a8');

      expect(loggerServiceMock.info).toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('project created');
      expect(result.data.id).toBe(project.id);
      expect(result.data.name).toBe(project.name);
      expect(result.data.description).toBe(project.description);
    });

  });

  describe('findAll', () => {

    it('should return empty array if no projects were found', async () => {
      const emptyObject: any = {};

      (projectRepositoryMock.find as jest.Mock).mockResolvedValue(emptyObject);

      const result = await projectService.findAll();

      expect(result).toEqual([]);
    });

    it('should return ProjectDto array if projects were found', async () => {
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

      const projectOne = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        ownerId: userJamesSmith.id,
        userProjectRole: [],
      };

      const projectTwo = {
        id: '2d790a4d-7c9c-4e23-9c9c-5749c5fa7fdb',
        name: 'Project Two',
        description: 'Second project description.',
        createdAt: new Date('2024-02-01T12:00:00Z'),
        ownerId: userChristopherAnderson.id,
        userProjectRole: [],
      };

      const projectThree = {
        id: '8304e5ff-6324-4863-ac51-8fcbc6812b13',
        name: 'Project Three',
        description: 'Third project description.',
        createdAt: new Date('2024-03-01T12:00:00Z'),
        ownerId: userRonaldClark.id,
        userProjectRole: [],
      };

      const projectFour = {
        id: '8304e5ff-6324-4863-ac51-8fcbc6812b13',
        name: 'Project Four',
        description: 'Fourth project description.',
        createdAt: new Date('2024-04-01T12:00:00Z'),
        ownerId: userRonaldClark.id,
        userProjectRole: [],
      };

      const projectsList: Project[] = [projectOne, projectTwo, projectThree, projectFour];

      (projectRepositoryMock.find as jest.Mock).mockResolvedValue(projectsList);

      const result = await projectService.findAll();

      expect(projectRepositoryMock.find).toHaveBeenCalled();
      expect(result.length).toBe(projectsList.length);
      expect(result).toEqual(projectsList);
    });

  });

  describe('findAllByUserId', () => {

    it('should throw BadRequestException for invalid user id', async () => {
      await expect(projectService.findAllByUserId('1')).rejects.toThrow(
        BadRequestException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if userService.findOneById fails', async () => {
      (userServiceMock.findOneById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(projectService.findAllByUserId('af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existing user', async () => {
      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(null);

      await expect(projectService.findAllByUserId('af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        NotFoundException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if userProjectRoleRepository.find fails', async () => {
      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      (userProjectRoleRepositoryMock.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(projectService.findAllByUserId('af7c1fe6-d669-414e-b066-e9733f0de7a8')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should return projects with the owner when user exists and has projects', async () => {
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

      const userMaryWright = {
        id: '1ad1fccc-d279-46a0-8980-1d91afd6ba67',
        firstname: "Mary",
        lastname: "Wright",
        email: "@fakemail.com",
      };

      const projectOne = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: '2024-01-01T12:00:00Z',
        ownerId: userJamesSmith.id,
      };

      const projectTwo = {
        id: '2d790a4d-7c9c-4e23-9c9c-5749c5fa7fdb',
        name: 'Project Two',
        description: 'Second project description.',
        createdAt: '2024-02-01T12:00:00Z',
        ownerId: userChristopherAnderson.id,
      };

      const projectThree = {
        id: '8304e5ff-6324-4863-ac51-8fcbc6812b13',
        name: 'Project Three',
        description: 'Third project description.',
        createdAt: '2024-03-01T12:00:00Z',
        ownerId: userRonaldClark.id,
      };

      const projectFour = {
        id: '8304e5ff-6324-4863-ac51-8fcbc6812b13',
        name: 'Project Four',
        description: 'Fourth project description.',
        createdAt: '2024-04-01T12:00:00Z',
        ownerId: userRonaldClark.id,
      };

      const userProjectRoles = [
        {
          id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
          user: userJamesSmith,
          project: projectOne,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: '96fdc209-0551-4d67-b9ad-0e9067a44bc4',
          user: userChristopherAnderson,
          project: projectOne,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
        {
          id: '0a7d6250-0be5-4036-8f23-33dc1762bed0',
          user: userRonaldClark,
          project: projectTwo,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: '1783be11-03db-4c65-b921-2cf939b5ae8e',
          user: userJamesSmith,
          project: projectTwo,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
        {
          id: 'ca52a95c-8bb4-4a9f-a0cf-f0df437592da',
          user: userMaryWright,
          project: projectThree,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: 'a9a8729d-a29b-48ed-be0a-f1b572cfc15b',
          user: userJamesSmith,
          project: projectThree,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
        {
          id: '4b1c6ff6-108f-4810-b20a-8c73fdab6f8b',
          user: userChristopherAnderson,
          project: projectFour,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: '8c4753ae-21ad-4153-8f32-1aacc4da2643',
          user: userRonaldClark,
          project: projectFour,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
        {
          id: 'fd8f9b93-9f12-4525-8b52-6fa140f24754',
          user: userMaryWright,
          project: projectFour,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
      ];

      // Mocks
      userServiceMock.findOneById = jest.fn().mockResolvedValue(userJamesSmith);
      userProjectRoleRepositoryMock.find = jest.fn().mockResolvedValue(userProjectRoles);

      const result = await projectService.findAllByUserId(userJamesSmith.id);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('3 projects found');
      expect(result.data.length).toBe(3);
      expect(result.data[0].owner.id).toBe(userJamesSmith.id);
    });

    it('should return empty list when user exists and has projects', async () => {
      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userProjectRoles = [];

      // Mocks
      userServiceMock.findOneById = jest.fn().mockResolvedValue(userJamesSmith);
      userProjectRoleRepositoryMock.find = jest.fn().mockResolvedValue(userProjectRoles);

      const result = await projectService.findAllByUserId(userJamesSmith.id);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('0 projects found');
      expect(result.data.length).toBe(0);
    });

    it('should return one project when user exists and has one projects', async () => {
      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userRonaldClark = {
        id: 'c558a80a-f319-4c10-95d4-4282ef745b4b',
        firstname: "Ronald",
        lastname: "Clark",
        email: "ronaldclark@fakemail.com",
      };

      const project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: '2024-01-01T12:00:00Z',
        ownerId: userRonaldClark.id,
      };

      const userProjectRoles = [
        {
          id: 'ca52a95c-8bb4-4a9f-a0cf-f0df437592da',
          user: userRonaldClark,
          project: project,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: 'a9a8729d-a29b-48ed-be0a-f1b572cfc15b',
          user: userJamesSmith,
          project: project,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        }
      ];

      // Mocks
      userServiceMock.findOneById = jest.fn().mockResolvedValue(userJamesSmith);
      userProjectRoleRepositoryMock.find = jest.fn().mockResolvedValue(userProjectRoles);

      const result = await projectService.findAllByUserId(userJamesSmith.id);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('1 project found');
      expect(result.data.length).toBe(1);
    });

  });

  describe('findOneById', () => {

    it('should throw BadRequestException for invalid project id', async () => {
      await expect(projectService.findOneById('1')).rejects.toThrow(
        BadRequestException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if projectRepository.findOne fails', async () => {
      (projectRepositoryMock.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(projectService.findOneById('5108babc-bf35-44d5-a9ba-de08badfa80a')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existing project', async () => {
      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);

      await expect(projectService.findOneById('5108babc-bf35-44d5-a9ba-de08badfa80a')).rejects.toThrow(
        NotFoundException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should return the project with the owner when project exists', async () => {
      const userJamesSmith: Partial<User> = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userChristopherAnderson: Partial<User> = {
        id: '08c71152-c552-42e7-b094-f510ff44e9cb',
        firstname: "Christopher",
        lastname: "Anderson",
        email: "christopheranderson@fakemail.com",
      };

      const projectOne: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const userProjectRoles: UserProjectRole[] = [
        {
          id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
          user: userJamesSmith as User,
          project: projectOne,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: '96fdc209-0551-4d67-b9ad-0e9067a44bc4',
          user: userChristopherAnderson as User,
          project: projectOne,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
      ];

      const project: Project = {
        ...projectOne,
        userProjectRole: [userProjectRoles[0], userProjectRoles[1]],
      };

      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(project);

      const result = await projectService.findOneById(projectOne.id);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('project found');
      expect(result.data.id).toBe(projectOne.id);
      expect(result.data.name).toBe(projectOne.name);
      expect(result.data.description).toBe(projectOne.description);
      expect(result.data.createdAt).toBe(projectOne.createdAt);
      expect(result.data.owner.id).toBe(userJamesSmith.id);
      expect(result.data.owner.firstname).toBe(userJamesSmith.firstname);
      expect(result.data.owner.lastname).toBe(userJamesSmith.lastname);
      expect(result.data.owner.email).toBe(userJamesSmith.email);

    });

    it('should return empty list when user exists and has projects', async () => {
      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userProjectRoles = [];

      // Mocks
      userServiceMock.findOneById = jest.fn().mockResolvedValue(userJamesSmith);
      userProjectRoleRepositoryMock.find = jest.fn().mockResolvedValue(userProjectRoles);

      const result = await projectService.findAllByUserId(userJamesSmith.id);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('0 projects found');
      expect(result.data.length).toBe(0);
      expect(result.data).toEqual([]);
    });

    it('should return one project when user exists and has one projects', async () => {

      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userRonaldClark = {
        id: 'c558a80a-f319-4c10-95d4-4282ef745b4b',
        firstname: "Ronald",
        lastname: "Clark",
        email: "ronaldclark@fakemail.com",
      };

      const project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project One',
        description: 'First project description.',
        createdAt: '2024-01-01T12:00:00Z',
        ownerId: userRonaldClark.id,
      };

      const userProjectRoles = [
        {
          id: 'ca52a95c-8bb4-4a9f-a0cf-f0df437592da',
          user: userRonaldClark,
          project: project,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: 'a9a8729d-a29b-48ed-be0a-f1b572cfc15b',
          user: userJamesSmith,
          project: project,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        }
      ];

      // Mocks
      userServiceMock.findOneById = jest.fn().mockResolvedValue(userJamesSmith);
      userProjectRoleRepositoryMock.find = jest.fn().mockResolvedValue(userProjectRoles);

      const result = await projectService.findAllByUserId(userJamesSmith.id);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('1 project found');
      expect(result.data.length).toBe(1);
    });

  });

  describe('update', () => {

    it('should throw BadRequestException for invalid project id', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated description.',
      };
      await expect(projectService.update('1', updateProjectDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if projectRepository.findOne fails', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated description.',
      };

      (projectRepositoryMock.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(projectService.update('5108babc-bf35-44d5-a9ba-de08badfa80a', updateProjectDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existing project', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated description.',
      };
      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);
      await expect(projectService.update('5108babc-bf35-44d5-a9ba-de08badfa80a', updateProjectDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw BadRequestException for missing parameters', async () => {
      const updateProjectDto: any = {}

      const userJamesSmith = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      (userServiceMock.findOneById as jest.Mock).mockResolvedValue(userJamesSmith);
      
      await expect(projectService.update('5108babc-bf35-44d5-a9ba-de08badfa80a', updateProjectDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated description.',
      };
      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: []
      };

      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(projectService.update('5108babc-bf35-44d5-a9ba-de08badfa80a', updateProjectDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should return updated project if only name changes', async () => {

      const userJamesSmith: Partial<User> = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userChristopherAnderson: Partial<User> = {
        id: '08c71152-c552-42e7-b094-f510ff44e9cb',
        firstname: "Christopher",
        lastname: "Anderson",
        email: "christopheranderson@fakemail.com",
      };

      const updateProjectDto: Partial<UpdateProjectDto> = {
        name: 'Updated Name',
      };

      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project Name',
        description: 'Project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const updatedProject: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: updateProjectDto.name,
        description: 'Project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const userProjectRoles: UserProjectRole[] = [
        {
          id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
          user: userJamesSmith as User,
          project: project,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: '96fdc209-0551-4d67-b9ad-0e9067a44bc4',
          user: userChristopherAnderson as User,
          project: project,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
      ];

      project.userProjectRole = userProjectRoles;
      updatedProject.userProjectRole = userProjectRoles;

      (projectRepositoryMock.findOne as jest.Mock)
        .mockResolvedValueOnce(project)
        .mockResolvedValueOnce(updatedProject);
      (projectRepositoryMock.update as jest.Mock).mockResolvedValue(updatedProject);

      const result = await projectService.update('5108babc-bf35-44d5-a9ba-de08badfa80a', updateProjectDto as UpdateProjectDto);

      expect(loggerServiceMock.info).toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('project updated');
      expect(result.data.id).toBe(updatedProject.id);
      expect(result.data.name).toBe(updatedProject.name);
      expect(result.data.description).toBe(updatedProject.description);
      expect(result.data.createdAt).toBe(updatedProject.createdAt);
    });

    it('should return updated project if only description changes', async () => {

      const userJamesSmith: Partial<User> = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userChristopherAnderson: Partial<User> = {
        id: '08c71152-c552-42e7-b094-f510ff44e9cb',
        firstname: "Christopher",
        lastname: "Anderson",
        email: "christopheranderson@fakemail.com",
      };

      const updateProjectDto: Partial<UpdateProjectDto> = {
        description: 'Updated description.',
      };

      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project Name',
        description: updateProjectDto.description,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const updatedProject: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: updateProjectDto.name,
        description: '',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const userProjectRoles: UserProjectRole[] = [
        {
          id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
          user: userJamesSmith as User,
          project: project,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: '96fdc209-0551-4d67-b9ad-0e9067a44bc4',
          user: userChristopherAnderson as User,
          project: project,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
      ];

      project.userProjectRole = userProjectRoles;
      updatedProject.userProjectRole = userProjectRoles;

      (projectRepositoryMock.findOne as jest.Mock)
        .mockResolvedValueOnce(project)
        .mockResolvedValueOnce(updatedProject);
      (projectRepositoryMock.update as jest.Mock).mockResolvedValue(updatedProject);

      const result = await projectService.update('5108babc-bf35-44d5-a9ba-de08badfa80a', updateProjectDto as UpdateProjectDto);

      expect(loggerServiceMock.info).toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('project updated');
      expect(result.data.id).toBe(updatedProject.id);
      expect(result.data.name).toBe(updatedProject.name);
      expect(result.data.description).toBe(updatedProject.description);
      expect(result.data.createdAt).toBe(updatedProject.createdAt);
    });

    it('should return updated project if update succeeds', async () => {

      const userJamesSmith: Partial<User> = {
        id: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
        firstname: "James",
        lastname: "Smith",
        email: "jamessmith@fakemail.com",
      };

      const userChristopherAnderson: Partial<User> = {
        id: '08c71152-c552-42e7-b094-f510ff44e9cb',
        firstname: "Christopher",
        lastname: "Anderson",
        email: "christopheranderson@fakemail.com",
      };

      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated description.',
      };

      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project Name',
        description: 'Project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const updatedProject: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: [],
      };

      const userProjectRoles: UserProjectRole[] = [
        {
          id: 'fd4a096f-93f5-4f2a-86c6-69a2d20365ff',
          user: userJamesSmith as User,
          project: project,
          projectRole: ProjectRole.OWNER,
          createdAt: new Date(),
        },
        {
          id: '96fdc209-0551-4d67-b9ad-0e9067a44bc4',
          user: userChristopherAnderson as User,
          project: project,
          projectRole: ProjectRole.MEMBER,
          createdAt: new Date(),
        },
      ];

      project.userProjectRole = userProjectRoles;
      updatedProject.userProjectRole = userProjectRoles;

      (projectRepositoryMock.findOne as jest.Mock)
        .mockResolvedValueOnce(project)
        .mockResolvedValueOnce(updatedProject);
      (projectRepositoryMock.update as jest.Mock).mockResolvedValue(updatedProject);

      const result = await projectService.update('5108babc-bf35-44d5-a9ba-de08badfa80a', updateProjectDto);

      expect(loggerServiceMock.info).toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('project updated');
      expect(result.data.id).toBe(updatedProject.id);
      expect(result.data.name).toBe(updatedProject.name);
      expect(result.data.description).toBe(updatedProject.description);
      expect(result.data.createdAt).toBe(updatedProject.createdAt);
    });

  });

  describe('remove', () => {

    it('should throw BadRequestException for invalid project id', async () => {
      await expect(projectService.remove('1')).rejects.toThrow(
        BadRequestException,
      );
      expect(loggerServiceMock.warn).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if projectRepository.findOne fails', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated description.',
      };

      (projectRepositoryMock.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(projectService.remove('5108babc-bf35-44d5-a9ba-de08badfa80a')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existing project', async () => {
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated description.',
      };

      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);

      await expect(projectService.remove('5108babc-bf35-44d5-a9ba-de08badfa80a')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project Name',
        description: 'Project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: []
      };

      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(projectService.remove('5108babc-bf35-44d5-a9ba-de08badfa80a')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should return success if delete succeeds', async () => {
      const project: Project = {
        id: '5108babc-bf35-44d5-a9ba-de08badfa80a',
        name: 'Project Name',
        description: 'Project description.',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        userProjectRole: []
      };

      (projectRepositoryMock.findOne as jest.Mock).mockResolvedValue(project);
      (projectRepositoryMock.delete as jest.Mock).mockResolvedValue(project);

      const result = await projectService.remove('5108babc-bf35-44d5-a9ba-de08badfa80a');

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('project deleted');
    });

  });

});