import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { User } from 'src/resources/user/entities/user.entity';
import { Project } from 'src/resources/project/entities/project.entity';
import { GlobalRole } from 'src/resources/user/enums/global-role';
import users from './test-data/users.json';
import projects from './test-data/projects.json';
import { CreateProjectDto } from 'src/resources/project/dto/create-project.dto';
import { AssignUserDto } from 'src/resources/project/dto/assign-user.dto';
import { UserProjectRole } from 'src/resources/project/entities/user-project-role.entity';
import { ProjectRole } from 'src/resources/project/enums/project-role';
import { Log } from 'src/logger/entities/log.entity';

@Injectable()
export class SeedService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
        @InjectRepository(UserProjectRole) private readonly userProjectRoleRepository: Repository<UserProjectRole>,
        @InjectRepository(Log) private readonly logRepository: Repository<Log>,
    ) { }

    public async seed() {
        await this.seedAdmin();
        await this.seedMyUser();
        await this.seedUsers();
        await this.seedProjects();
        await this.seedLogs();
    }

    private async seedAdmin() {
        if (await this.userRepository.findOne({ where: { email: "admin@taskflow.com" } })) {
            return;
        }

        const newUser: RegisterUserDto = {
            firstname: "Adrian",
            lastname: "Matei",
            email: "admin@taskflow.com",
            password: await hash("P@ssword123", 12),
            passwordConfirmation: await hash("P@ssword123", 12),
        }

        const user = this.userRepository.create({
            ...newUser,
            createdAt: new Date(),
        });

        if (user) {
            user.emailVerified = true;
            await this.userRepository.save(user);
        }
    }

    private async seedMyUser() {
        if (!process.env.DEFAULT_USER_EMAIL ||
            !process.env.DEFAULT_USER_FIRSTNAME ||
            !process.env.DEFAULT_USER_LASTNAME) {
            return;
        }

        if (await this.userRepository.findOne({ where: { email: process.env.DEFAULT_USER_EMAIL } })) {
            return;
        }

        const newUser: RegisterUserDto = {
            firstname: process.env.DEFAULT_USER_FIRSTNAME,
            lastname: process.env.DEFAULT_USER_LASTNAME,
            email: process.env.DEFAULT_USER_EMAIL.toLocaleLowerCase(),
            password: await hash("P@ssword123", 12),
            passwordConfirmation: await hash("P@ssword123", 12),
        }

        const user = this.userRepository.create({
            ...newUser,
            createdAt: new Date(),
            globalRole: GlobalRole.REGULAR_USER,
        });

        if (user) {
            user.emailVerified = true;
            await this.userRepository.save(user);
        }

    }

    private async seedUsers() {
        const testUsers: User[] = (await this.userRepository.find()).filter(user => user.email.includes("@test.com"));

        if (testUsers.length > 0) {
            return;
        }

        for (const testUser of users) {
            const firstname: string = testUser.firstname;
            const lastname: string = testUser.lastname;
            const createdAt: string = testUser.createdAt;

            const newUser: RegisterUserDto = {
                firstname: firstname,
                lastname: lastname,
                email: (firstname + lastname + "@test.com").toLocaleLowerCase(),
                password: await hash("P@ssword123", 12),
                passwordConfirmation: await hash("P@ssword123", 12),
            }

            const user = this.userRepository.create({
                ...newUser,
                createdAt: new Date(createdAt),
                globalRole: GlobalRole.REGULAR_USER,
            });

            if (user) {
                user.emailVerified = true;
                const createdUser = await this.userRepository.save(user);
            }
        }
    }

    private async seedProjects() {
        const testUsers: User[] = (await this.userRepository.find()).filter(user => user.email.includes("@test.com"));

        if (testUsers.length === 0) {
            return;
        }

        const userProjectRole: UserProjectRole[] = await this.userProjectRoleRepository.find({ where: { user: { id: testUsers[0].id } } });

        if (userProjectRole.length > 0) {
            return;
        }

        for (var i = 0; i < users.length; i++) {
            const ownerEmail: string = (users[i].firstname + users[i].lastname + "@test.com").toLocaleLowerCase();

            const newProject: CreateProjectDto = {
                name: projects[i].name,
                description: projects[i].description,
            }

            const createdProject: Project = this.projectRepository.create({
                ...newProject,
                createdAt: projects[i].createdAt,
            });
            await this.projectRepository.save(createdProject);

            const userProjectRole: AssignUserDto = {
                project: createdProject,
                user: await this.userRepository.findOne({ where: { email: ownerEmail } }),
                projectRole: ProjectRole.OWNER,
                createdAt: new Date(projects[i].createdAt),
            }
            await this.userProjectRoleRepository.save(userProjectRole);

            const shuffled = [...users.slice()].sort(() => 0.5 - Math.random());
            const min: number = 3;
            const max: number = 7;
            const randomLength = Math.floor(Math.random() * (max - min + 1)) + min;
            const members = shuffled.slice(0, randomLength);

            for (const member of members) {
                const memberEmail: string = (member.firstname + member.lastname + "@test.com").toLocaleLowerCase();
                if (memberEmail !== ownerEmail) {
                    const userProjectRole: AssignUserDto = {
                        project: createdProject,
                        user: await this.userRepository.findOne({ where: { email: (member.firstname + member.lastname + "@test.com").toLocaleLowerCase() } }),
                        projectRole: ProjectRole.MEMBER,
                        createdAt: new Date(projects[i].createdAt),
                    }
                    await this.userProjectRoleRepository.save(userProjectRole);
                }
            }
        }
    }

    private async seedLogs() {
        const logs: Log[] = await this.logRepository.find();
        if (logs.length > 0) {
            return;
        }

        const jamesSmithId = (await this.userRepository.findOne({
            where: {
                email: 'jamessmith@test.com',
            }
        })).id;

        const randomUserId = 'af7c1fe6-d669-414e-b066-e9733f0de7a8';
        const randomProjectId = '5108babc-bf35-44d5-a9ba-de08badfa80a';
        const invalidId = '1';

        const project = {
            name: 'Test Project',
            description: 'This is a test project.'
        }
        const emptyProject = {};
        const projectWithNoName = {
            description: 'This is a test project.'
        };
        const projectWithNoDescription = {
            name: 'Test Project'
        };

        const missingProjectNameAndDescription = "name,description";
        const missingProjectName = "name";
        const missingProjectDescription = "description";

        const ERROR: string = 'ERROR';
        const WARN: string = 'WARN';
        const INFO: string = 'INFO';

        const databaseErrorMessage = 'Database connection error.';

        const projectServiceCreateContext = 'ProjectService.create';
        const projectsServiceFindAllByUserIdContext = 'ProjectService.findAllByUserId';
        const projectServiceFindOneByIdContext = 'ProjectService.findOneById';
        const projectServiceUpdateContext = 'ProjectService.update';
        const projectServiceRemoveContext = 'ProjectService.remove';



        // 01. ProjectService.create - userService.findOneById fails
        await this.addLog(ERROR, `Failed to find user with id ${jamesSmithId}.`, projectServiceCreateContext, new Date("2020/01/18 18:50:09"), { project, jamesSmithId }, databaseErrorMessage);

        // 02. ProjectService.create - user not found
        await this.addLog(WARN, `Failed to find user with id ${randomUserId}.`, projectServiceCreateContext, new Date("2020/01/19 10:27:42"), { project, randomUserId });

        // 03. ProjectService.create - no name, no description
        await this.addLog(WARN, `Could not create project. Missing properties: ${missingProjectNameAndDescription}.`, projectServiceCreateContext, new Date("2020/01/19 10:32:51"), { emptyProject, jamesSmithId });

        // 04. ProjectService.create - no name
        await this.addLog(WARN, `Could not create project. Missing properties: ${missingProjectName}.`, projectServiceCreateContext, new Date("2020/01/19 10:37:21"), { projectWithNoName, jamesSmithId });

        // 05. ProjectService.create - no description
        await this.addLog(WARN, `Could not create project. Missing properties: ${missingProjectDescription}.`, projectServiceCreateContext, new Date("2020/01/19 10:40:37"), { projectWithNoDescription, jamesSmithId });

        // 06. ProjectService.create - database calls fail
        await this.addLog(ERROR, `Failed to create project "${project.name}".`, projectServiceCreateContext, new Date("2020/01/19 10:50:13"), { project, jamesSmithId }, databaseErrorMessage);

        // 07. ProjectService.create - create project
        await this.addLog(INFO, `Created project: "${project.name}"`, projectServiceCreateContext, new Date("2020/01/19 10:57:48"), { project, jamesSmithId });



        // 08. ProjectService.findAllByUserId - invalid user id
        await this.addLog(WARN, `Could not retrieve user's projects. The provided user id (${invalidId}) was not a valid UUID.`, projectsServiceFindAllByUserIdContext, new Date("2020/01/19 11:02:55"), invalidId);

        // 09. ProjectService.findAllByUserId - userService.findOneById fails
        await this.addLog(ERROR, `Failed to find user with id ${jamesSmithId}.`, projectsServiceFindAllByUserIdContext, new Date("2020/01/19 11:10:22"), jamesSmithId);

        // 10. ProjectService.findAllByUserId - user not found
        await this.addLog(WARN, `Failed to find user with id ${randomUserId}.`, projectsServiceFindAllByUserIdContext, new Date("2020/01/19 11:23:39"), randomUserId);

        // 11. ProjectService.findAllByUserId - database calls fail
        await this.addLog(ERROR, `Failed to retrieve user's projects.`, projectsServiceFindAllByUserIdContext, new Date("2020/01/19 11:33:30"), randomUserId, databaseErrorMessage);



        // 12. ProjectService.findOneById - invalid project id
        await this.addLog(WARN, `Could not retrieve project. The provided project id (${randomProjectId}) was not a valid UUID.`, projectServiceFindOneByIdContext, new Date("2020/01/19 12:13:59"), randomProjectId);

        // 13. ProjectService.findOneById - projectRepository.findOne fails
        await this.addLog(ERROR, `Failed to find project with id ${randomProjectId}.`, projectServiceFindOneByIdContext, new Date("2020/01/19 12:21:12"), randomProjectId, databaseErrorMessage);

        // 14. ProjectService.findOneById - project not found
        await this.addLog(WARN, `Could not retreive project. Project with id ${randomProjectId} not found.`, projectServiceFindOneByIdContext, new Date("2020/01/19 12:35:26"), randomProjectId);



        // 15. ProjectService.update - invalid project id
        await this.addLog(WARN, `Could not update project. The provided project id (${randomProjectId}) was not a valid UUID.`, projectServiceUpdateContext, new Date("2020/01/20 11:10:02"), { randomProjectId, project });

        // 16. ProjectService.update - projectRepository.findOne fails
        await this.addLog(ERROR, `Failed to find project with id ${randomProjectId}.`, projectServiceUpdateContext, new Date("2020/01/20 11:14:28"), { randomProjectId, project }, databaseErrorMessage);

        // 17. ProjectService.update - project not found
        await this.addLog(WARN, `Could not update project. Project with id ${randomProjectId} not found.`, projectServiceUpdateContext, new Date("2020/01/20 11:19:53"), { randomProjectId, project });

        // 18. ProjectService.update - no name, no description
        await this.addLog(WARN, `Could not update project "${project.name}". Missing properties: ${missingProjectNameAndDescription}.`, projectServiceUpdateContext, new Date("2020/01/20 11:31:44"), { randomProjectId, emptyProject });

        // 19. ProjectService.update - no name
        await this.addLog(WARN, `Could not update project "${project.name}". Missing properties: ${missingProjectName}.`, projectServiceUpdateContext, new Date("2020/01/20 11:36:18"), { randomProjectId, projectWithNoName });

        // 20. ProjectService.update - no description
        await this.addLog(WARN, `Could not update project "${project.name}". Missing properties: ${missingProjectDescription}.`, projectServiceUpdateContext, new Date("2020/01/20 11:39:58"), { randomProjectId, projectWithNoDescription });

        // 21. ProjectService.update - projectRepository.update fails
        await this.addLog(WARN, `Failed to update project "${project.name}".`, projectServiceUpdateContext, new Date("2020/01/20 11:43:19"), { randomProjectId, project });

        // 22. ProjectService.update - update project
        await this.addLog(INFO, `Updated project: ${project.name}`, projectServiceUpdateContext, new Date("2020/01/20 11:57:43"), { randomProjectId, project });



        // 23. ProjectService.remove - invalid project id
        await this.addLog(WARN, `Could not update project. The provided project id (${invalidId}) was not a valid UUID.`, projectServiceRemoveContext, new Date("2020/01/28 16:09:15"), { invalidId, project });

        // 24. ProjectService.remove - projectRepository.findOne fails
        await this.addLog(ERROR, `Failed to find project with id ${randomProjectId}.`, projectServiceRemoveContext, new Date("2020/01/28 16:11:42"), { randomProjectId, project }, databaseErrorMessage);

        // 25. ProjectService.remove - project not found
        await this.addLog(WARN, `Could not update project. Project with id ${randomProjectId} not found.`, projectServiceRemoveContext, new Date("2020/01/28 16:13:56"), { randomProjectId, project });

        // 26. ProjectService.update - projectRepository.remove fails
        await this.addLog(ERROR, `Failed to update project "${project.name}".`, projectServiceRemoveContext, new Date("2020/01/28 16:20:03"), { randomProjectId, project }, databaseErrorMessage);

        // 27. ProjectService.update - delete project
        await this.addLog(INFO, `Deleted project: ${project.name}`, projectServiceRemoveContext, new Date("2020/01/28 16:31:59"), { randomProjectId, project });
    }

    private async addLog(level: string, message: string, context: string, timestamp: Date, metadata?: any, trace?: string) {
        const log = this.logRepository.create({ level, message, context, metadata, trace, timestamp });
        await this.logRepository.save(log);
    }

}
