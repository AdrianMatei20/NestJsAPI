import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { UserProjectRole } from '../project/entities/user-project-role.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepositoryMock: any;
  let projectRepositoryMock: any;
  let userProjectRoleRepositoryMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
