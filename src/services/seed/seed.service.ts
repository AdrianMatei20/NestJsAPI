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

@Injectable()
export class SeedService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
        @InjectRepository(UserProjectRole) private readonly userProjectRoleRepository: Repository<UserProjectRole>,
    ) { }

    public async seed() {
        await this.seedAdmin();
        await this.seedMyUser();
        await this.seedUsers();
        await this.seedProjects();
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
                await this.userRepository.save(user);
            }
        }
    }

    private async seedProjects() {
        const testUsers: User[] = (await this.userRepository.find()).filter(user => user.email.includes("@test.com"));

        if (testUsers.length === 0) {
            return;
        }

        const userProjectRole: UserProjectRole[] = await this.userProjectRoleRepository.find({where: {user: {id: testUsers[0].id}}});

        if(userProjectRole.length > 0) {
            return;
        }

        for (var i = 0; i < users.length; i++) {
            const ownerEmail: string = (users[i].firstname + users[i].lastname + "@test.com").toLocaleLowerCase();

            const newProject: CreateProjectDto = {
                name: projects[i].name,
                description: projects[i].description,
            }

            const createdProject: Project = await this.projectRepository.create({
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

}
