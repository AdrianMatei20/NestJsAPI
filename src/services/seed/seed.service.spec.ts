import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/resources/user/entities/user.entity';
import { Project } from 'src/resources/project/entities/project.entity';
import { UserProjectRole } from 'src/resources/project/entities/user-project-role.entity';
import { ProjectService } from 'src/resources/project/project.service';
import { LoggerService } from 'src/logger/logger.service';
import { UserService } from 'src/resources/user/user.service';
import { AuthService } from 'src/auth/auth.service';

describe('SeedService', () => {
  let seedService: SeedService;
  let mockUserRepository: any;
  let mockProjectRepository: any;
  let mockUserProjectRoleRepository: any;
  let mockLoggerService: LoggerService;
  let mockProjectService: any;
  let mockUserService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: getRepositoryToken(UserProjectRole),
          useValue: mockUserProjectRoleRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    seedService = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(seedService).toBeDefined();
  });
});
