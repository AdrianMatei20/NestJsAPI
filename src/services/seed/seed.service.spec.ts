import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { SeedService } from './seed.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/resources/user/entities/user.entity';
import { Project } from 'src/resources/project/entities/project.entity';
import { UserProjectRole } from 'src/resources/project/entities/user-project-role.entity';
import { Log } from 'src/logger/entities/log.entity';
import { ProjectService } from 'src/resources/project/project.service';
import { LoggerService } from 'src/logger/logger.service';
import { UserService } from 'src/resources/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { ObjectValidationService } from '../object-validation/object-validation.service';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';
import { ResetPasswordService } from 'src/auth/reset-password/reset-password.service';
import { JwtService } from '@nestjs/jwt';
import { ResetPassword } from 'src/auth/reset-password/reset-password.entity';
import { userJamesSmith } from 'test/data/users';
import { toBeBoolean, toBeTrue } from 'jest-extended';

describe('SeedService', () => {
  let seedService: SeedService;
  let userRepository: Repository<User>;
  let projectRepository: Repository<Project>;
  let userProjectRoleRepository: Repository<UserProjectRole>;
  let loggerRepository: Repository<Log>;
  let mockEmailService: any;

  beforeEach(async () => {
    const { toBeBoolean, toBeTrue, toBeFalse } = require('jest-extended');
    expect.extend({ toBeBoolean, toBeTrue, toBeFalse });

    if (!expect.getState().currentTestName?.includes('skip')) {
      process.env.SECRET = 'mocked-secret';
      process.env.ADMIN_USER_EMAIL = 'ADMIN_USER_EMAIL';
      process.env.DEFAULT_USER_EMAIL = 'DEFAULT_USER_EMAIL';
      process.env.DEFAULT_USER_FIRSTNAME = 'DEFAULT_USER_FIRSTNAME';
      process.env.DEFAULT_USER_LASTNAME = 'DEFAULT_USER_LASTNAME';
      process.env.DEFAULT_PASSWORD = 'DEFAULT_PASSWORD';
    } else {
      delete process.env.SECRET;
      delete process.env.ADMIN_USER_EMAIL;
      delete process.env.DEFAULT_USER_EMAIL;
      delete process.env.DEFAULT_USER_FIRSTNAME;
      delete process.env.DEFAULT_USER_LASTNAME;
      delete process.env.DEFAULT_PASSWORD;
    }

    mockEmailService = {
      sendRegistrationEmail: jest.fn().mockResolvedValue(true),
      sendResetPasswordEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, UserProjectRole, Project, Log, ResetPassword],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User, UserProjectRole, Project, Log, ResetPassword]),
      ],
      providers: [
        SeedService,
        ProjectService,
        UserService,
        AuthService,
        ObjectValidationService,
        LoggerService,
        { provide: EmailService, useValue: mockEmailService },
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn().mockImplementation((token) => {
              if (token === 'valid-token') return { id: userJamesSmith.id, email: userJamesSmith.email };
              throw new Error('Invalid token');
            }),
          },
        },
        ResetPasswordService,
      ],
    }).compile();

    seedService = module.get<SeedService>(SeedService);

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
    userProjectRoleRepository = module.get<Repository<UserProjectRole>>(getRepositoryToken(UserProjectRole));
    loggerRepository = module.get<Repository<Log>>(getRepositoryToken(Log));
  });

  afterEach(async () => {
    await userRepository.clear();
    await projectRepository.clear();
    await userProjectRoleRepository.clear();
    await loggerRepository.clear();
  });

  it('should be defined', () => {
    expect(seedService).toBeDefined();
  });

  describe('seed', () => {
    it('should seed database', async () => {
      await seedService.seed();

      const adminExists: boolean = await userRepository.exists({
        where: { email: 'admin_user_email' }
      });
      expect(adminExists).toBeTrue();

      const myUserExists: boolean = await userRepository.exists({
        where: { email: 'default_user_email' }
      });
      expect(myUserExists).toBeTrue();

      const userCount: number = await userRepository.count();
      expect(userCount).toBe(52);

      const projectsCount: number = await projectRepository.count();
      expect(projectsCount).toBe(50);

      const userProjectRolesCount: number = await userProjectRoleRepository.count();
      expect(userProjectRolesCount).toBeGreaterThanOrEqual(100);

      const logsCount: number = await loggerRepository.count();
      expect(logsCount).toBeGreaterThanOrEqual(100);

    }, 25000);

    it('should skip seeding if environment variables not set', async () => {
      await seedService.seed();

      const adminExists: boolean = await userRepository.exists({
        where: { email: 'admin_user_email' }
      });
      expect(adminExists).toBeFalse();

      const myUserExists: boolean = await userRepository.exists({
        where: { email: 'default_user_email' }
      });
      expect(myUserExists).toBeFalse();

      const userCount: number = await userRepository.count();
      expect(userCount).toBe(0);

      const projectsCount: number = await projectRepository.count();
      expect(projectsCount).toBe(0);

      const userProjectRolesCount: number = await userProjectRoleRepository.count();
      expect(userProjectRolesCount).toBe(0);

      const logsCount: number = await loggerRepository.count();
      expect(logsCount).toBe(0);
    });

    it('should not seed the database multiple times', async () => {
      await seedService.seed();
      await seedService.seed();

      const adminExists: boolean = await userRepository.exists({
        where: { email: 'admin_user_email' }
      });
      expect(adminExists).toBeTrue();

      const myUserExists: boolean = await userRepository.exists({
        where: { email: 'default_user_email' }
      });
      expect(myUserExists).toBeTrue();

      const userCount: number = await userRepository.count();
      expect(userCount).toBe(52);

      const projectsCount: number = await projectRepository.count();
      expect(projectsCount).toBe(50);

      const userProjectRolesCount: number = await userProjectRoleRepository.count();
      expect(userProjectRolesCount).toBeGreaterThanOrEqual(100);

      const logsCount: number = await loggerRepository.count();
      expect(logsCount).toBeGreaterThanOrEqual(100);

    }, 25000);
  });

});
