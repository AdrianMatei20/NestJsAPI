import { CreateProjectDto } from "../../src/resources/project/dto/create-project.dto";
import { UpdateProjectDto } from "../../src/resources/project/dto/update-project.dto";
import { Project } from "../../src/resources/project/entities/project.entity";
import { User } from "../../src/resources/user/entities/user.entity";
import { ProjectRole } from "../../src/resources/project/enums/project-role";
import { UserProjectRole } from "../../src/resources/project/entities/user-project-role.entity";
import { userJamesSmith, userChristopherAnderson, userRonaldClark, userMaryWright, user } from "../../test/data/users";
import { projectUUIDs, userProjectRoleUUIDs } from "./UUIDs";

// 01. A way to create projects.
export const createProjectDto: CreateProjectDto = {
    name: 'Test',
    description: 'This is a test project.',
};

// 02. Attempt to create a project with no name and no description.
export const createProjectDtoEmpty: Partial<CreateProjectDto> = {}

// 03. Attempt to create a project with no name.
export const createProjectDtoNoName: Partial<CreateProjectDto> = {
    description: 'This is a test project.',
};

// 04. Attempt to create a project with no description.
export const createProjectDtoNoDescription: Partial<CreateProjectDto> = {
    name: 'Test',
}

// 05. A regular project with an owner
export const project: Project = {
    id: projectUUIDs[0],
    name: 'Project Name',
    description: 'Project description.',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    userProjectRoles: [
        {
            id: userJamesSmith.id,
            user: user,
            project: null,
            projectRole: ProjectRole.OWNER,
            createdAt: new Date(),
        }
    ],
};
export const userProjectRole: UserProjectRole = {
    id: userProjectRoleUUIDs[0],
    user: userJamesSmith as User,
    project: project,
    projectRole: ProjectRole.OWNER,
    createdAt: new Date(),
};

// 06. Other projects
export const projectOne: Project = {
    id: projectUUIDs[0],
    name: 'Project One',
    description: 'First project description.',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    userProjectRoles: [
        {
            id: userProjectRoleUUIDs[0],
            user: user,
            project: null,
            projectRole: ProjectRole.OWNER,
            createdAt: new Date(),
        }
    ],
};
export const projectTwo: Project = {
    id: projectUUIDs[1],
    name: 'Project Two',
    description: 'Second project description.',
    createdAt: new Date('2024-02-01T12:00:00Z'),
    userProjectRoles: [
        {
            id: userJamesSmith.id,
            user: user,
            project: null,
            projectRole: ProjectRole.OWNER,
            createdAt: new Date(),
        }
    ],
};
export const projectThree: Project = {
    id: projectUUIDs[2],
    name: 'Project Three',
    description: 'Third project description.',
    createdAt: new Date('2024-03-01T12:00:00Z'),
    userProjectRoles: [
        {
            id: userJamesSmith.id,
            user: user,
            project: null,
            projectRole: ProjectRole.OWNER,
            createdAt: new Date(),
        }
    ],
};
export const projectFour: Project = {
    id: projectUUIDs[3],
    name: 'Project Four',
    description: 'Fourth project description.',
    createdAt: new Date('2024-04-01T12:00:00Z'),
    userProjectRoles: [
        {
            id: userJamesSmith.id,
            user: user,
            project: null,
            projectRole: ProjectRole.OWNER,
            createdAt: new Date(),
        }
    ],
};
export const projects: Project[] = [projectOne, projectTwo, projectThree, projectFour];

export const userProjectRoles = [
    {
        id: userProjectRoleUUIDs[0],
        user: userJamesSmith,
        project: projectOne,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[1],
        user: userChristopherAnderson,
        project: projectOne,
        projectRole: ProjectRole.EDITOR,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[2],
        user: userRonaldClark,
        project: projectTwo,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[3],
        user: userJamesSmith,
        project: projectTwo,
        projectRole: ProjectRole.EDITOR,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[4],
        user: userMaryWright,
        project: projectThree,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[5],
        user: userJamesSmith,
        project: projectThree,
        projectRole: ProjectRole.EDITOR,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[6],
        user: userChristopherAnderson,
        project: projectFour,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[7],
        user: userRonaldClark,
        project: projectFour,
        projectRole: ProjectRole.EDITOR,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[8],
        user: userMaryWright,
        project: projectFour,
        projectRole: ProjectRole.EDITOR,
        createdAt: new Date(),
    },
];

export const RonaldOwnerAndJamesMember = [
    {
        id: userProjectRoleUUIDs[9],
        user: userRonaldClark,
        project: project,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[10],
        user: userJamesSmith,
        project: project,
        projectRole: ProjectRole.EDITOR,
        createdAt: new Date(),
    },
];

export const JamesOwnerAndChristopherMember: UserProjectRole[] = [
    {
        id: userProjectRoleUUIDs[11],
        user: userJamesSmith as User,
        project: projectOne,
        projectRole: ProjectRole.OWNER,
        createdAt: new Date(),
    },
    {
        id: userProjectRoleUUIDs[12],
        user: userChristopherAnderson as User,
        project: projectOne,
        projectRole: ProjectRole.EDITOR,
        createdAt: new Date(),
    },
];

export const projectWithJamesOwnerAndChristopherMember: Project = {
    ...projectOne,
    userProjectRoles: JamesOwnerAndChristopherMember,
};

export const updateProjectDto: UpdateProjectDto = {
    name: 'Updated Name',
    description: 'Updated description.',
};

export const updateProjectDtoEmpty: Partial<UpdateProjectDto> = {};

export const updateProjectDtoNoDescription: Partial<UpdateProjectDto> = {
    name: 'Updated Name',
};

export const updateProjectDtoNoName: Partial<UpdateProjectDto> = {
    description: 'Updated description.',
};