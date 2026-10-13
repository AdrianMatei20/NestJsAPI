import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from 'src/resources/project/entities/project.entity';
import { UserProjectRole } from 'src/resources/project/entities/user-project-role.entity';
import { User } from 'src/resources/user/entities/user.entity';
import { GlobalRole } from 'src/resources/user/enums/global-role';
import { ProjectRole } from 'src/resources/project/enums/project-role';
import { ProjectService } from 'src/resources/project/project.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/resources/user/user.service';
import { RegisterUserDto } from 'src/resources/user/dto/register-user.dto';
import { CreateProjectDto } from 'src/resources/project/dto/create-project.dto';
import { UpdateProjectDto } from 'src/resources/project/dto/update-project.dto';
import { AssignUserDto } from 'src/resources/project/dto/assign-user.dto';
import users from './test-data/users.json';
import projects from './test-data/projects.json';
import projectUpdates from './test-data/project-changes.json';

@Injectable()
export class SeedService {

    constructor(
        @InjectRepository(UserProjectRole) private readonly userProjectRoleRepository: Repository<UserProjectRole>,
        private readonly projectService: ProjectService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) { }

    public async seed() {
        await this.seedAdmin();
        await this.seedMyUser();
        await this.seedUsers();
        await this.seedProjects();
    }

    private async seedAdmin() {
        if (!process.env.ADMIN_USER_EMAIL ||
            !process.env.DEFAULT_USER_FIRSTNAME ||
            !process.env.DEFAULT_USER_LASTNAME ||
            !process.env.DEFAULT_PASSWORD) {
            return;
        }

        if (await this.userService.findOneByEmail(process.env.ADMIN_USER_EMAIL)) {
            return;
        }

        const newUser: RegisterUserDto = {
            firstname: process.env.DEFAULT_USER_FIRSTNAME,
            lastname: process.env.DEFAULT_USER_LASTNAME,
            email: process.env.ADMIN_USER_EMAIL.toLocaleLowerCase(),
            password: process.env.DEFAULT_PASSWORD,
            passwordConfirmation: process.env.DEFAULT_PASSWORD,
        }

        await this.authService.registerUser(newUser, false);
        const user: User = await this.userService.findOneByEmail(newUser.email);

        if (user) {
            user.emailVerified = true;
            user.globalRole = GlobalRole.ADMIN;
            await this.userService.update(user.id, user);
        }
    }

    private async seedMyUser() {
        if (!process.env.DEFAULT_USER_EMAIL ||
            !process.env.DEFAULT_USER_FIRSTNAME ||
            !process.env.DEFAULT_USER_LASTNAME ||
            !process.env.DEFAULT_PASSWORD) {
            return;
        }

        if (await this.userService.findOneByEmail(process.env.DEFAULT_USER_EMAIL)) {
            return;
        }

        const newUser: RegisterUserDto = {
            firstname: process.env.DEFAULT_USER_FIRSTNAME,
            lastname: process.env.DEFAULT_USER_LASTNAME,
            email: process.env.DEFAULT_USER_EMAIL.toLocaleLowerCase(),
            password: process.env.DEFAULT_PASSWORD,
            passwordConfirmation: process.env.DEFAULT_PASSWORD,
        }

        await this.authService.registerUser(newUser, false);
        const user: User = await this.userService.findOneByEmail(newUser.email);

        if (user) {
            user.emailVerified = true;
            await this.userService.update(user.id, user);
        }
    }

    private async seedUsers() {
        if (!process.env.DEFAULT_PASSWORD) {
            return;
        }

        const testUsers: User[] = (await this.userService.findAll()).filter(user => user.email.includes("@test.com"));

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
                password: process.env.DEFAULT_PASSWORD,
                passwordConfirmation: process.env.DEFAULT_PASSWORD,
            }

            await this.authService.registerUser(newUser, false);
            const user: User = await this.userService.findOneByEmail(newUser.email);

            if (user) {
                user.emailVerified = true;
                user.createdAt = new Date(createdAt);
                await this.userService.update(user.id, user);
            }
        }
    }

    private async seedProjects() {
        const testUsers: User[] = (await this.userService.findAll()).filter(user => user.email.includes("@test.com"));

        if (testUsers.length === 0) {
            return;
        }

        const existingUserProjectRole: UserProjectRole = await this.userProjectRoleRepository.findOne({ where: { user: { id: testUsers[0].id } } });

        if (existingUserProjectRole) {
            return;
        }

        // Look members up in memory instead of a DB round trip per member (email -> User is fixed for the whole seed run).
        const userByEmail = new Map<string, User>(testUsers.map(user => [user.email, user]));
        const emailFor = (person: { firstname: string; lastname: string }): string =>
            (person.firstname + person.lastname + "@test.com").toLocaleLowerCase();

        let projectIds: string[] = [];
        let newUserProjectRoles: AssignUserDto[] = [];

        for (let i = 0; i < users.length; i++) {
            const owner = userByEmail.get(emailFor(users[i]));

            const newProject: CreateProjectDto = {
                name: projects[i].name,
                description: projects[i].description,
            }

            const project: Project = await this.projectService.create(newProject, owner.id);

            if (projectUpdates.some(projectUpdate => projectUpdate.name === project.name)) {
                projectIds.push(project.id);
            }

            // Membership is fixed in test-data/projects.json (memberIndices), so the same
            // users are assigned to the same projects on every seed run.
            for (const memberIndex of projects[i].memberIndices) {
                newUserProjectRoles.push({
                    project,
                    user: userByEmail.get(emailFor(users[memberIndex])),
                    projectRole: ProjectRole.EDITOR,
                    createdAt: new Date(projects[i].createdAt),
                });
            }
        }

        // One batched insert instead of one awaited save per membership row.
        await this.userProjectRoleRepository.save(newUserProjectRoles);

        for (let i = 0; i < projectIds.length; i++) {
            let updateProjectDto: UpdateProjectDto = {
                name: projectUpdates[i].name,
                description: projectUpdates[i].description,
            }

            await this.projectService.update(projectIds[i], updateProjectDto);
        }

        await this.seedSampleBadRequests();
    }

    // Deliberately trigger a handful of invalid requests through the normal service methods
    // (same code paths a real bad request would hit), purely so the log table also contains
    // realistic WARN entries (validation, not-found, conflict) instead of only the INFO
    // entries produced by successful seeding above. Every one of these throws before any
    // write occurs, so none of them has a side effect beyond the log row itself.
    private async seedSampleBadRequests() {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        const invalidId = 'not-a-valid-uuid';
        const existingTestUser = users[0];

        // Conflict: email already registered.
        try {
            await this.authService.registerUser({
                firstname: existingTestUser.firstname,
                lastname: existingTestUser.lastname,
                email: (existingTestUser.firstname + existingTestUser.lastname + "@test.com").toLocaleLowerCase(),
                password: process.env.DEFAULT_PASSWORD,
                passwordConfirmation: process.env.DEFAULT_PASSWORD,
            }, false);
        } catch { /* expected: email already registered */ }

        // Bad request: passwords don't match.
        try {
            await this.authService.registerUser({
                firstname: 'Seed',
                lastname: 'Check',
                email: 'seed-bad-request-check@test.com',
                password: 'P@ssword123',
                passwordConfirmation: 'DoesNotMatch456',
            }, false);
        } catch { /* expected: passwords don't match */ }

        // Bad request: missing required properties.
        try {
            await this.authService.registerUser({ firstname: 'Seed', lastname: 'Check' } as RegisterUserDto, false);
        } catch { /* expected: missing properties */ }

        // Not found: valid UUID shape, but no such project.
        try {
            await this.projectService.findOneById(nonExistentId);
        } catch { /* expected: project not found */ }

        // Bad request: malformed project id.
        try {
            await this.projectService.findOneById(invalidId);
        } catch { /* expected: invalid project id */ }

        // Not found: valid UUID shape, but no such user, when creating a project.
        try {
            await this.projectService.create({
                name: 'Seed check',
                description: 'Intentionally invalid; used only to generate a WARN log entry.',
            }, nonExistentId);
        } catch { /* expected: user not found */ }
    }

}
