import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/resources/user/entities/user.entity';
import { Project } from 'src/resources/project/entities/project.entity';
import { UserProjectRole } from 'src/resources/project/entities/user-project-role.entity';
import { Log } from 'src/logger/entities/log.entity';

describe('SeedService', () => {
  let service: SeedService;
  let userRepositoryMock: any;
  let projectRepositoryMock: any;
  let userProjectRoleRepositoryMock: any;
  let loggerRepositoryMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: projectRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserProjectRole),
          useValue: userProjectRoleRepositoryMock,
        },
        {
          provide: getRepositoryToken(Log),
          useValue: loggerRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
