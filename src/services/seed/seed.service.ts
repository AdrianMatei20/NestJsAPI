import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../../src/resources/project/entities/project.entity';
import { UserProjectRole } from '../../../src/resources/project/entities/user-project-role.entity';
import { User } from '../../../src/resources/user/entities/user.entity';
import { GlobalRole } from '../../../src/resources/user/enums/global-role';
import { ProjectRole } from '../../../src/resources/project/enums/project-role';
import { ProjectService } from '../../../src/resources/project/project.service';
import { AuthService } from '../../../src/auth/auth.service';
import { UserService } from '../../../src/resources/user/user.service';
import { RegisterUserDto } from '../../../src/resources/user/dto/register-user.dto';
import { CreateProjectDto } from '../../../src/resources/project/dto/create-project.dto';
import { UpdateProjectDto } from '../../../src/resources/project/dto/update-project.dto';
import { AssignUserDto } from '../../../src/resources/project/dto/assign-user.dto';
import users from './test-data/users.json';
import projects from './test-data/projects.json';
import projectUpdates from './test-data/project-changes.json';

@Injectable()
export class SeedService {

    constructor(
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
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

        if (await this.userService.findOneByEmail(process.env.ADMIN_USER_EMAIL.toLocaleLowerCase())) {
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

        const userProjectRole: UserProjectRole[] = await this.userProjectRoleRepository.find({ where: { user: { id: testUsers[0].id } } });

        if (userProjectRole.length > 0) {
            return;
        }

        let projectIds = [];

        for (let i = 0; i < users.length; i++) {
            const ownerEmail: string = (users[i].firstname + users[i].lastname + "@test.com").toLocaleLowerCase();
            const user = await this.userService.findOneByEmail(ownerEmail);

            const newProject: CreateProjectDto = {
                name: projects[i].name,
                description: projects[i].description,
            }

            const createResponse = await this.projectService.create(newProject, user.id);

            const project = await this.projectRepository.findOne({ where: { id: createResponse.id } });

            if (projectUpdates.some(projectUpdate => projectUpdate.name === project.name)) {
                projectIds.push(project.id);
            }

            const shuffled = [...users.slice()].sort(() => 0.5 - Math.random());
            const min: number = 3;
            const max: number = 7;
            const randomLength = Math.floor(Math.random() * (max - min + 1)) + min;
            const members = shuffled.slice(0, randomLength);

            for (const member of members) {
                const memberEmail: string = (member.firstname + member.lastname + "@test.com").toLocaleLowerCase();
                if (memberEmail !== ownerEmail) {
                    const userProjectRole: AssignUserDto = {
                        project: project,
                        user: await this.userService.findOneByEmail(memberEmail),
                        projectRole: ProjectRole.MEMBER,
                        createdAt: new Date(projects[i].createdAt),
                    }
                    await this.userProjectRoleRepository.save(userProjectRole);
                }
            }
        }

        for (let i = 0; i < projectIds.length; i++) {
            let updateProjectDto: UpdateProjectDto = {
                name: projectUpdates[i].name,
                description: projectUpdates[i].description,
            }

            await this.projectService.update(projectIds[i], updateProjectDto);
        }
    }

}
